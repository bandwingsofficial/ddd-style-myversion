// src/modules/auth/domain/models/otp-request.model.ts

import { ValidationError } from '../../../../common/errors';
import { ActorType } from '../enums/actor-type.enum';
import { OtpPurpose } from '../enums/otp-purpose.enum';
import { Phone } from '../value-objects/phone.vo';
import { TokenHash } from '../value-objects/token-hash.vo';

export class OtpRequest {
  readonly id: string;
  readonly actorType: ActorType;
  readonly actorId?: string;
  readonly phone: Phone;
  readonly purpose: OtpPurpose;

  readonly otpHash: TokenHash;
  readonly attempts: number;

  readonly expiresAt: Date;
  readonly verifiedAt?: Date;
  readonly createdAt: Date;

  private constructor(params: {
    id: string;
    actorType: ActorType;
    actorId?: string;
    phone: Phone;
    purpose: OtpPurpose;
    otpHash: TokenHash;
    attempts: number;
    expiresAt: Date;
    verifiedAt?: Date;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.actorType = params.actorType;
    this.actorId = params.actorId;
    this.phone = params.phone;
    this.purpose = params.purpose;

    this.otpHash = params.otpHash;
    this.attempts = params.attempts;

    this.expiresAt = params.expiresAt;
    this.verifiedAt = params.verifiedAt;
    this.createdAt = params.createdAt;

    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    actorType: ActorType;
    phone: Phone;
    purpose: OtpPurpose;
    otpHash: TokenHash;
    ttlMs: number;
    actorId?: string;
    now?: Date;
  }): OtpRequest {
    const now = params.now ?? new Date();

    return new OtpRequest({
      id: params.id,
      actorType: params.actorType,
      actorId: params.actorId,
      phone: params.phone,
      purpose: params.purpose,
      otpHash: params.otpHash,
      attempts: 0,
      createdAt: now,
      expiresAt: new Date(now.getTime() + params.ttlMs),
    });
  }

  static rehydrate(params: {
    id: string;
    actorType: ActorType;
    actorId?: string;
    phone: Phone;
    purpose: OtpPurpose;
    otpHash: TokenHash;
    attempts: number;
    expiresAt: Date;
    verifiedAt?: Date;
    createdAt: Date;
  }): OtpRequest {
    return new OtpRequest(params);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isExpired(now: Date = new Date()): boolean {
    return now >= this.expiresAt;
  }

  isVerified(): boolean {
    return !!this.verifiedAt;
  }

  canAttempt(now: Date = new Date()): boolean {
    return !this.isExpired(now) && !this.isVerified();
  }

  /* ---------------------------------------------- */
  /* DOMAIN GUARDS                                  */
  /* ---------------------------------------------- */

  assertCanVerify(now: Date = new Date()): void {
    if (this.isVerified()) {
      throw new ValidationError(
        'OTP_ALREADY_VERIFIED',
        'OTP has already been verified',
        { otpRequestId: this.id },
      );
    }

    if (this.isExpired(now)) {
      throw new ValidationError(
        'OTP_EXPIRED',
        'OTP has expired',
        {
          otpRequestId: this.id,
          expiresAt: this.expiresAt,
        },
      );
    }

    if (this.attempts < 0) {
      throw new ValidationError(
        'OTP_INVALID_ATTEMPT_COUNT',
        'Invalid OTP attempt count',
        { attempts: this.attempts },
      );
    }
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  recordAttempt(): OtpRequest {
    this.assertCanVerify();

    return new OtpRequest({
      id: this.id,
      actorType: this.actorType,
      actorId: this.actorId,
      phone: this.phone,
      purpose: this.purpose,
      otpHash: this.otpHash,
      attempts: this.attempts + 1,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      verifiedAt: this.verifiedAt,
    });
  }

  markVerified(now: Date = new Date()): OtpRequest {
    this.assertCanVerify(now);

    return new OtpRequest({
      id: this.id,
      actorType: this.actorType,
      actorId: this.actorId,
      phone: this.phone,
      purpose: this.purpose,
      otpHash: this.otpHash,
      attempts: this.attempts,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      verifiedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* DOMAIN INVARIANTS                              */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (this.expiresAt <= this.createdAt) {
      throw new ValidationError(
        'OTP_INVALID_EXPIRY',
        'OTP expiresAt must be after createdAt',
        {
          createdAt: this.createdAt,
          expiresAt: this.expiresAt,
        },
      );
    }

    if (this.verifiedAt && this.verifiedAt < this.createdAt) {
      throw new ValidationError(
        'OTP_INVALID_VERIFIED_TIME',
        'OTP verifiedAt cannot be before createdAt',
        {
          createdAt: this.createdAt,
          verifiedAt: this.verifiedAt,
        },
      );
    }

    if (this.attempts < 0) {
      throw new ValidationError(
        'OTP_NEGATIVE_ATTEMPTS',
        'OTP attempts cannot be negative',
        {
          attempts: this.attempts,
        },
      );
    }
  }
}
