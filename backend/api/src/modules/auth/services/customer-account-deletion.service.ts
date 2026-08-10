import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';

import { ActorType } from '../domain/enums/actor-type.enum';
import { AuditAction } from '../domain/enums/audit-action.enum';
import { OtpPurpose } from '../domain/enums/otp-purpose.enum';

import { Phone } from '../domain/value-objects/phone.vo';

import { CustomerRepository } from '../repositories/customer.repository';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AuthSessionRepository } from '../repositories/auth-session.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { OtpRequestRepository } from '../repositories/otp-request.repository';
import { MfaChallengeRepository } from '../repositories/mfa-challenge.repository';

import { OtpService } from './otp.service';

import { ValidationError } from '../../../common/errors';
import { AuthErrors } from '../constants/auth-errors';

@Injectable()
export class CustomerAccountDeletionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly customerRepo: CustomerRepository,
    private readonly auditRepo: AuditLogRepository,
    private readonly sessionRepo: AuthSessionRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly otpRepo: OtpRequestRepository,
    private readonly mfaRepo: MfaChallengeRepository,
    private readonly otpService: OtpService,
  ) {}

  /* ================================================= */
  /* OTP REQUEST (SENSITIVE_ACTION)                   */
  /* ================================================= */

  async requestDeletionOtp(params: {
    phone: string;
    actorId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.otpService.requestOtp({
      actorType: ActorType.CUSTOMER,
      phone: params.phone,
      purpose: OtpPurpose.SENSITIVE_ACTION,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  /* ================================================= */
  /* AUTHENTICATED SELF-DELETE (JWT only, no OTP)     */
  /* ================================================= */

  async deleteAuthenticatedAccount(params: {
    customerId: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ deleted: true }> {
    const customer = await this.customerRepo.findById(params.customerId);

    if (!customer) {
      throw new ValidationError(
        AuthErrors.ACCOUNT_NOT_FOUND,
        'Customer account not found',
      );
    }

    await this.performDeletion({
      customerId: customer.id,
      phone: customer.phone.getRaw(),
      sessionId: params.sessionId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return { deleted: true };
  }

  /* ================================================= */
  /* PUBLIC DELETE (PHONE + OTP)                      */
  /* ================================================= */

  async deleteAccountByPhone(params: {
    phone: string;
    otp: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ deleted: true }> {
    const phone = Phone.fromRaw(params.phone);

    await this.otpService.verifyOtp({
      actorType: ActorType.CUSTOMER,
      phone: phone.getRaw(),
      purpose: OtpPurpose.SENSITIVE_ACTION,
      otp: params.otp,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    const customer = await this.customerRepo.findByPhone(phone);

    // Anti-enumeration: verified OTP + no account → same success response.
    if (!customer) {
      return { deleted: true };
    }

    await this.performDeletion({
      customerId: customer.id,
      phone: phone.getRaw(),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return { deleted: true };
  }

  /* ================================================= */
  /* CORE DELETION (SINGLE IMPLEMENTATION)            */
  /* ================================================= */

  private async performDeletion(params: {
    customerId: string;
    phone: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const existing = await this.customerRepo.findById(params.customerId);
    if (!existing) {
      throw new ValidationError(
        AuthErrors.ACCOUNT_ALREADY_DELETED,
        'Account has already been deleted',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // 1) Detach historical business records (orders/payments/delivery stay).
      await tx.order.updateMany({
        where: { customerId: params.customerId },
        data: { customerId: null },
      });

      // 2) Invalidate auth sessions + refresh tokens (do not hard-delete
      //    sessions referenced by AuditLog FKs).
      const sessions = await this.sessionRepo.findActiveByActor(
        ActorType.CUSTOMER,
        params.customerId,
        tx,
      );

      for (const session of sessions) {
        await this.refreshTokenRepo.revokeBySessionId(session.id, tx);
      }

      await this.sessionRepo.revokeAllForActor(
        ActorType.CUSTOMER,
        params.customerId,
        tx,
      );

      // Also revoke any remaining refresh tokens on already-revoked sessions.
      const allSessions = await tx.authSession.findMany({
        where: {
          actorType: 'CUSTOMER',
          actorId: params.customerId,
        },
        select: { id: true },
      });

      for (const session of allSessions) {
        await this.refreshTokenRepo.revokeBySessionId(session.id, tx);
      }

      // 3) Clean OTP + MFA rows for this identity.
      await this.otpRepo.deleteByPhone(params.phone, tx);
      await this.mfaRepo.deleteByActor(
        ActorType.CUSTOMER,
        params.customerId,
        tx,
      );

      // 4) Audit BEFORE deleting customer (actorId is a plain string, not FK).
      await this.auditRepo.create(
        {
          actorType: ActorType.CUSTOMER,
          actorId: params.customerId,
          sessionId: params.sessionId,
          action: AuditAction.CUSTOMER_ACCOUNT_DELETED,
          metadata: {
            reason: 'CUSTOMER_SELF_DELETE',
            // phone intentionally omitted
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );

      // 5) Delete customer — cascades profile, saved addresses, carts
      //    (Order.cartId already ON DELETE SET NULL).
      await this.customerRepo.deleteById(params.customerId, tx);
    });

    await this.clearCustomerRedisAuthState(params.phone);
  }

  private async clearCustomerRedisAuthState(phone: string): Promise<void> {
    const purposes = Object.values(OtpPurpose);
    const keys: string[] = [];

    for (const purpose of purposes) {
      const baseKey = `${ActorType.CUSTOMER}:${phone}:${purpose}`;
      keys.push(
        `otp:block:${baseKey}`,
        `otp:cooldown:${baseKey}`,
        `otp:send:hour:${baseKey}`,
        `otp:verify:ghost:${baseKey}`,
      );
    }

    await Promise.all(keys.map((key) => this.redis.del(key)));
  }
}
