import { Injectable } from '@nestjs/common';

import { ActorType } from '../domain/enums/actor-type.enum';
import { AuditAction } from '../domain/enums/audit-action.enum';

import { AuditLogRepository } from '../repositories/audit-log.repository';
import { OutletUserRepository } from '../repositories/outlet-user.repository';
import { SuperAdminRepository } from '../repositories/super-admin.repository';

import { IdentityActivePolicy } from '../policies/identity-active.policy';

import {
  UnauthorizedError,
  ForbiddenError,
} from '../../../common/errors';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { AuthErrors } from '../constants/auth-errors';

/* ===== INFRA HELPERS ===== */

import { PasswordHelper } from '../../../infrastructure/security/password.helper';
import { TotpHelper } from '../../../infrastructure/security/totp.helper';
import { LockTimeHelper } from '../../../infrastructure/security/lock-time.helper';

/* ===== SECURITY CONSTANTS ===== */

const PASSWORD_SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

@Injectable()
export class CredentialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outletUserRepo: OutletUserRepository,
    private readonly superAdminRepo: SuperAdminRepository,
    private readonly auditRepo: AuditLogRepository,
  ) {}

  /* ================================================= */
  /* PASSWORD VERIFICATION                             */
  /* ================================================= */

  async verifyPassword(params: {
    actorType: ActorType;
    actorId: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    switch (params.actorType) {
      case ActorType.OUTLET_USER:
        return this.verifyOutletUserPassword(params);

      case ActorType.SUPER_ADMIN:
        return this.verifySuperAdminPassword(params);

      default:
        throw new UnauthorizedError(
          AuthErrors.INVALID_CREDENTIALS,
          'Invalid credentials',
        );
    }
  }

  private async verifyOutletUserPassword(params: {
    actorId: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const user = await this.outletUserRepo.findById(params.actorId);

    if (!user) {
      throw new UnauthorizedError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    IdentityActivePolicy.check(user);

    // 🚫 Account already locked
    if (user.isLocked()) {
      throw new ForbiddenError(
        AuthErrors.ACCOUNT_LOCKED,
        'Account temporarily locked',
      );
    }

    const valid = await PasswordHelper.verify(
      params.password,
      user.passwordHash,
    );

    if (!valid) {
      await this.prisma.$transaction(async (tx) => {
        const updated =
          await this.outletUserRepo.incrementFailedAttempts(
            user.id,
            tx,
          );

        if (updated.failedAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockUntil = LockTimeHelper.lockUntil(
            LOCK_DURATION_MINUTES,
          );

          await this.outletUserRepo.lockUntil(
            user.id,
            lockUntil,
            tx,
          );
        }

        await this.auditRepo.create(
          {
            actorType: ActorType.OUTLET_USER,
            actorId: user.id,
            action: AuditAction.LOGIN_FAILED,
            metadata: { reason: 'PASSWORD_INVALID' },
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
          },
          tx,
        );
      });

      throw new UnauthorizedError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    // ✅ Success → reset attempts
    await this.outletUserRepo.resetFailedAttempts(user.id);
  }

  private async verifySuperAdminPassword(params: {
    actorId: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const admin = await this.superAdminRepo.findById(params.actorId);

    if (!admin) {
      throw new UnauthorizedError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    IdentityActivePolicy.check(admin);

    const valid = await PasswordHelper.verify(
      params.password,
      admin.passwordHash,
    );

    if (!valid) {
      await this.auditRepo.create({
        actorType: ActorType.SUPER_ADMIN,
        actorId: admin.id,
        action: AuditAction.LOGIN_FAILED,
        metadata: { reason: 'PASSWORD_INVALID' },
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      throw new UnauthorizedError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }
  }

  /* ================================================= */
  /* PASSWORD HASHING                                  */
  /* ================================================= */

  async hashPassword(password: string): Promise<string> {
    return PasswordHelper.hash(
      password,
      PASSWORD_SALT_ROUNDS,
    );
  }

  /* ================================================= */
  /* TOTP (MFA) VERIFICATION                           */
  /* ================================================= */

  async verifyTotp(params: {
    actorType: ActorType;
    actorId: string;
    code: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    if (params.actorType !== ActorType.SUPER_ADMIN) {
      throw new UnauthorizedError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    const admin = await this.superAdminRepo.findById(params.actorId);

    if (!admin) {
      throw new UnauthorizedError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    IdentityActivePolicy.check(admin);

    if (!admin.totpSecret) {
      throw new UnauthorizedError(
        AuthErrors.MFA_REQUIRED,
        'Multi-factor authentication required',
      );
    }

    const isValid = TotpHelper.verify(
      params.code,
      admin.totpSecret,
    );

    if (!isValid) {
      await this.auditRepo.create({
        actorType: ActorType.SUPER_ADMIN,
        actorId: admin.id,
        action: AuditAction.MFA_FAILED,
        metadata: { reason: 'TOTP_INVALID' },
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      throw new UnauthorizedError(
        AuthErrors.MFA_INVALID,
        'Invalid MFA code',
      );
    }
  }
}
