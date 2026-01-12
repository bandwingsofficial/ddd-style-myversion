import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { RedisService } from '../../../infrastructure/redis/redis.service';
import { QueueService } from '../../../infrastructure/queue/queue.service';
import { OTP_JOBS } from '../../../infrastructure/queue/queues/otp.queue';

import { AuditLogRepository } from '../repositories/audit-log.repository';
import { OtpRequestRepository } from '../repositories/otp-request.repository';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { ActorType } from '../domain/enums/actor-type.enum';
import { AuditAction } from '../domain/enums/audit-action.enum';
import { OtpPurpose } from '../domain/enums/otp-purpose.enum';

import { Phone } from '../domain/value-objects/phone.vo';
import { TokenHash } from '../domain/value-objects/token-hash.vo';

import { ForbiddenError, ValidationError } from '../../../common/errors';
import { AuthErrors } from '../constants/auth-errors';
import { OTP_CONSTANTS } from '../constants/otp.constants';

@Injectable()
export class OtpService {
  private readonly ttlSeconds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly otpRepo: OtpRequestRepository,
    private readonly auditRepo: AuditLogRepository,
    private readonly redis: RedisService,
    private readonly queueService: QueueService,
    config: ConfigService,
  ) {
    this.ttlSeconds =
      config.get<number>('otp.ttlSeconds') ??
      OTP_CONSTANTS.DEFAULT_TTL_SECONDS;
  }

  /* ================================================= */
  /* REQUEST OTP                                      */
  /* ================================================= */

  async requestOtp(params: {
    actorType: ActorType;
    phone: string;
    purpose: OtpPurpose;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{
    cooldownSeconds: number;
    remainingResends: number;
  }> {
    const phone = Phone.fromRaw(params.phone);

    const baseKey = `${params.actorType}:${phone.getRaw()}:${params.purpose}`;
    const blockKey = `otp:block:${baseKey}`;
    const cooldownKey = `otp:cooldown:${baseKey}`;
    const hourKey = `otp:send:hour:${baseKey}`;

    /* ---------- HARD BLOCK ---------- */
    if (await this.redis.exists(blockKey)) {
      const ttl = await this.redis.getTtl(blockKey);

      throw new ForbiddenError(
        AuthErrors.OTP_BLOCKED,
        'OTP temporarily blocked due to multiple failures',
        {
          retryAfterSeconds:
            ttl > 0 ? ttl : OTP_CONSTANTS.BLOCK_DURATION_SECONDS,
        },
      );
    }

    /* ---------- RESEND COOLDOWN ---------- */
    if (await this.redis.exists(cooldownKey)) {
      const ttl = await this.redis.getTtl(cooldownKey);

      throw new ValidationError(
        AuthErrors.OTP_ALREADY_SENT,
        'OTP already sent. Please wait before retrying',
        { retryAfterSeconds: ttl },
      );
    }

    /* ---------- HOURLY LIMIT ---------- */
    const count = await this.redis.incr(hourKey);
    if (count === 1) {
      await this.redis.expire(hourKey, 3600);
    }

    if (count > OTP_CONSTANTS.MAX_SEND_PER_HOUR) {
      throw new ValidationError(
        AuthErrors.OTP_SEND_LIMIT_EXCEEDED,
        'OTP send limit exceeded',
      );
    }

    /* ---------- GENERATE OTP ---------- */
    const otp = this.generateOtp();
    const otpHash = TokenHash.fromHash(this.hashOtp(otp));
    const expiresAt = new Date(Date.now() + this.ttlSeconds * 1000);

    await this.prisma.$transaction(async (tx) => {
      await this.otpRepo.create(
        {
          actorType: params.actorType,
          phone,
          purpose: params.purpose,
          otpHash,
          expiresAt,
        },
        tx,
      );

      await this.auditRepo.create(
        {
          actorType: params.actorType,
          action: AuditAction.OTP_REQUESTED,
          metadata: { phone: phone.getRaw(), purpose: params.purpose },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    /* ---------- RESEND COOLDOWN ---------- */
    await this.redis.set(
      cooldownKey,
      '1',
      OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS,
    );

    /* ---------- ASYNC OTP DELIVERY ---------- */
    await this.queueService.addOtpJob(OTP_JOBS.SEND, {
      phone: phone.getRaw(),
      otp,
      actorType: params.actorType,
      purpose: params.purpose,
    });

    return {
      cooldownSeconds: OTP_CONSTANTS.RESEND_COOLDOWN_SECONDS,
      remainingResends: Math.max(
        0,
        OTP_CONSTANTS.MAX_SEND_PER_HOUR - count,
      ),
    };
  }

  /* ================================================= */
  /* VERIFY OTP                                       */
  /* ================================================= */

  async verifyOtp(params: {
    actorType: ActorType;
    phone: string;
    purpose: OtpPurpose;
    otp: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const phone = Phone.fromRaw(params.phone);

    const baseKey = `${params.actorType}:${phone.getRaw()}:${params.purpose}`;
    const blockKey = `otp:block:${baseKey}`;
    const ghostAttemptKey = `otp:verify:ghost:${baseKey}`;

    /* ---------- HARD BLOCK ---------- */
    if (await this.redis.exists(blockKey)) {
      const ttl = await this.redis.getTtl(blockKey);

      throw new ForbiddenError(
        AuthErrors.OTP_BLOCKED,
        'OTP temporarily blocked due to multiple failures',
        {
          retryAfterSeconds:
            ttl > 0 ? ttl : OTP_CONSTANTS.BLOCK_DURATION_SECONDS,
        },
      );
    }

    if (
      !params.otp ||
      !/^\d+$/.test(params.otp) ||
      params.otp.length !== OTP_CONSTANTS.CODE_LENGTH
    ) {
      throw new ValidationError(
        AuthErrors.INVALID_OTP,
        'Invalid OTP',
      );
    }

    const otpRequest = await this.otpRepo.findLatestValid({
      phone,
      purpose: params.purpose,
      actorType: params.actorType,
      now: new Date(),
    });

    /* ---------- NO VALID OTP ---------- */
    if (!otpRequest) {
      const attempts = await this.redis.incr(ghostAttemptKey);

      if (attempts === 1) {
        await this.redis.expire(
          ghostAttemptKey,
          this.ttlSeconds,
        );
      }

      const remaining =
        OTP_CONSTANTS.MAX_VERIFY_ATTEMPTS - attempts;

      if (remaining <= 0) {
        await this.redis.set(
          blockKey,
          '1',
          OTP_CONSTANTS.BLOCK_DURATION_SECONDS,
        );

        throw new ForbiddenError(
          AuthErrors.OTP_BLOCKED,
          'OTP temporarily blocked due to multiple failures',
          {
            retryAfterSeconds:
              OTP_CONSTANTS.BLOCK_DURATION_SECONDS,
          },
        );
      }

      throw new ValidationError(
        AuthErrors.INVALID_OTP,
        'Invalid OTP',
        { remainingAttempts: remaining },
      );
    }

    otpRequest.assertCanVerify(new Date());

    const attemptKey = `otp:verify:attempts:${otpRequest.id}`;
    const incomingHash = TokenHash.fromHash(this.hashOtp(params.otp));

    /* ---------- OTP MISMATCH ---------- */
    if (!incomingHash.equals(otpRequest.otpHash)) {
      const attempts = await this.redis.incr(attemptKey);

      if (attempts === 1) {
        await this.redis.expire(attemptKey, this.ttlSeconds);
      }

      const remaining =
        OTP_CONSTANTS.MAX_VERIFY_ATTEMPTS - attempts;

      if (remaining <= 0) {
        await this.redis.set(
          blockKey,
          '1',
          OTP_CONSTANTS.BLOCK_DURATION_SECONDS,
        );

        throw new ForbiddenError(
          AuthErrors.OTP_BLOCKED,
          'OTP temporarily blocked due to multiple failures',
          {
            retryAfterSeconds:
              OTP_CONSTANTS.BLOCK_DURATION_SECONDS,
          },
        );
      }

      throw new ValidationError(
        AuthErrors.INVALID_OTP,
        'Invalid OTP',
        { remainingAttempts: remaining },
      );
    }

    /* ---------- SUCCESS ---------- */
    await this.prisma.$transaction(async (tx) => {
      await this.otpRepo.markVerified(otpRequest.id, tx);

      await this.auditRepo.create(
        {
          actorType: params.actorType,
          actorId: otpRequest.actorId,
          action: AuditAction.OTP_VERIFIED,
          metadata: { phone: phone.getRaw(), purpose: params.purpose },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    await this.redis.del(`otp:cooldown:${baseKey}`);
    await this.redis.del(`otp:send:hour:${baseKey}`);
    await this.redis.del(`otp:verify:attempts:${otpRequest.id}`);
    await this.redis.del(ghostAttemptKey);
    await this.redis.del(blockKey);
  }

  /* ================================================= */
  /* INTERNAL HELPERS                                 */
  /* ================================================= */

  private generateOtp(): string {
    return crypto
      .randomInt(
        10 ** (OTP_CONSTANTS.CODE_LENGTH - 1),
        10 ** OTP_CONSTANTS.CODE_LENGTH,
      )
      .toString();
  }

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }
}
