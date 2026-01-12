// src/modules/auth/domain/models/mfa-challenge.model.ts

import { ValidationError } from '../../../../common/errors';
import { ActorType } from '../enums/actor-type.enum';

export class MfaChallenge {
  readonly id: string;
  readonly actorType: ActorType;
  readonly actorId: string;

  readonly expiresAt: Date;
  readonly verifiedAt?: Date;
  readonly createdAt: Date;

  private constructor(params: {
    id: string;
    actorType: ActorType;
    actorId: string;
    expiresAt: Date;
    verifiedAt?: Date;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.actorType = params.actorType;
    this.actorId = params.actorId;
    this.expiresAt = params.expiresAt;
    this.verifiedAt = params.verifiedAt;
    this.createdAt = params.createdAt;

    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------- FACTORIES ---------- */

  static createNew(params: {
    id: string;
    actorType: ActorType;
    actorId: string;
    ttlMs: number;
    now?: Date;
  }): MfaChallenge {
    const now = params.now ?? new Date();

    return new MfaChallenge({
      id: params.id,
      actorType: params.actorType,
      actorId: params.actorId,
      createdAt: now,
      expiresAt: new Date(now.getTime() + params.ttlMs),
    });
  }

  static rehydrate(params: {
    id: string;
    actorType: ActorType;
    actorId: string;
    expiresAt: Date;
    verifiedAt?: Date;
    createdAt: Date;
  }): MfaChallenge {
    return new MfaChallenge(params);
  }

  /* ---------- QUERIES ---------- */

  isExpired(now: Date = new Date()): boolean {
    return now >= this.expiresAt;
  }

  isVerified(): boolean {
    return !!this.verifiedAt;
  }

  /* ---------- GUARDS ---------- */

  assertCanVerify(now: Date = new Date()): void {
    if (this.isVerified()) {
      throw new ValidationError(
        'MFA_CHALLENGE_ALREADY_VERIFIED',
        'MFA challenge has already been used',
        { challengeId: this.id },
      );
    }

    if (this.isExpired(now)) {
      throw new ValidationError(
        'MFA_CHALLENGE_EXPIRED',
        'MFA challenge has expired',
        {
          challengeId: this.id,
          expiresAt: this.expiresAt,
        },
      );
    }
  }

  /* ---------- TRANSITIONS ---------- */

  markVerified(now: Date = new Date()): MfaChallenge {
    this.assertCanVerify(now);

    return new MfaChallenge({
      id: this.id,
      actorType: this.actorType,
      actorId: this.actorId,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      verifiedAt: now,
    });
  }

  /* ---------- INVARIANTS ---------- */

  private assertValidState(): void {
    if (this.expiresAt <= this.createdAt) {
      throw new ValidationError(
        'MFA_CHALLENGE_INVALID_EXPIRY',
        'MFA challenge expiresAt must be after createdAt',
        {
          createdAt: this.createdAt,
          expiresAt: this.expiresAt,
        },
      );
    }

    if (this.verifiedAt && this.verifiedAt < this.createdAt) {
      throw new ValidationError(
        'MFA_CHALLENGE_INVALID_VERIFIED_TIME',
        'MFA challenge verifiedAt cannot be before createdAt',
        {
          createdAt: this.createdAt,
          verifiedAt: this.verifiedAt,
        },
      );
    }
  }
}
