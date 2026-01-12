// src/modules/auth/domain/models/outlet-user.model.ts

import { ValidationError } from '../../../../common/errors';

/**
 * OutletUser aggregate (auth perspective).
 * Represents staff/users created by admins for an outlet.
 */
export class OutletUser {
  readonly id: string;
  readonly outletId: string;

  readonly email: string;
  readonly passwordHash: string;

  readonly isActive: boolean;
  readonly failedAttempts: number;
  readonly lockedUntil?: Date;

  readonly tokenVersion: number;
  readonly createdAt: Date;

  private constructor(params: {
    id: string;
    outletId: string;
    email: string;
    passwordHash: string;
    isActive: boolean;
    failedAttempts: number;
    lockedUntil?: Date;
    tokenVersion: number;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.outletId = params.outletId;

    this.email = OutletUser.normalizeEmail(params.email);
    this.passwordHash = params.passwordHash;

    this.isActive = params.isActive;
    this.failedAttempts = params.failedAttempts;
    this.lockedUntil = params.lockedUntil;

    this.tokenVersion = params.tokenVersion;
    this.createdAt = params.createdAt;

    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    outletId: string;
    email: string;
    passwordHash: string;
    now?: Date;
  }): OutletUser {
    const now = params.now ?? new Date();

    return new OutletUser({
      id: params.id,
      outletId: params.outletId,
      email: params.email,
      passwordHash: params.passwordHash,
      isActive: true,
      failedAttempts: 0,
      tokenVersion: 0,
      createdAt: now,
    });
  }

  static rehydrate(params: {
    id: string;
    outletId: string;
    email: string;
    passwordHash: string;
    isActive: boolean;
    failedAttempts: number;
    lockedUntil?: Date;
    tokenVersion: number;
    createdAt: Date;
  }): OutletUser {
    return new OutletUser(params);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isLocked(now: Date = new Date()): boolean {
    return !!this.lockedUntil && now < this.lockedUntil;
  }

  canLogin(now: Date = new Date()): boolean {
    if (!this.isActive) return false;
    if (this.isLocked(now)) return false;
    return true;
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  recordFailedAttempt(params: {
    maxAttempts: number;
    lockDurationMs: number;
    now?: Date;
  }): OutletUser {
    const now = params.now ?? new Date();
    const nextAttempts = this.failedAttempts + 1;

    const shouldLock = nextAttempts >= params.maxAttempts;

    return new OutletUser({
      id: this.id,
      outletId: this.outletId,
      email: this.email,
      passwordHash: this.passwordHash,
      isActive: this.isActive,
      failedAttempts: nextAttempts,
      lockedUntil: shouldLock
        ? new Date(now.getTime() + params.lockDurationMs)
        : this.lockedUntil,
      tokenVersion: this.tokenVersion,
      createdAt: this.createdAt,
    });
  }

  resetFailedAttempts(): OutletUser {
    if (this.failedAttempts === 0 && !this.lockedUntil) return this;

    return new OutletUser({
      id: this.id,
      outletId: this.outletId,
      email: this.email,
      passwordHash: this.passwordHash,
      isActive: this.isActive,
      failedAttempts: 0,
      lockedUntil: undefined,
      tokenVersion: this.tokenVersion,
      createdAt: this.createdAt,
    });
  }

  deactivate(): OutletUser {
    if (!this.isActive) return this;

    return new OutletUser({
      id: this.id,
      outletId: this.outletId,
      email: this.email,
      passwordHash: this.passwordHash,
      isActive: false,
      failedAttempts: this.failedAttempts,
      lockedUntil: this.lockedUntil,
      tokenVersion: this.tokenVersion,
      createdAt: this.createdAt,
    });
  }

  bumpTokenVersion(): OutletUser {
    return new OutletUser({
      id: this.id,
      outletId: this.outletId,
      email: this.email,
      passwordHash: this.passwordHash,
      isActive: this.isActive,
      failedAttempts: this.failedAttempts,
      lockedUntil: this.lockedUntil,
      tokenVersion: this.tokenVersion + 1,
      createdAt: this.createdAt,
    });
  }

  /* ---------------------------------------------- */
  /* DOMAIN INVARIANTS                              */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (this.failedAttempts < 0) {
      throw new ValidationError(
        'OUTLET_USER_NEGATIVE_FAILED_ATTEMPTS',
        'failedAttempts cannot be negative',
        { failedAttempts: this.failedAttempts },
      );
    }

    if (this.lockedUntil && this.lockedUntil < this.createdAt) {
      throw new ValidationError(
        'OUTLET_USER_INVALID_LOCK_TIME',
        'lockedUntil cannot be before createdAt',
        {
          createdAt: this.createdAt,
          lockedUntil: this.lockedUntil,
        },
      );
    }

    if (this.failedAttempts === 0 && this.lockedUntil) {
      throw new ValidationError(
        'OUTLET_USER_LOCK_WITH_ZERO_ATTEMPTS',
        'lockedUntil cannot exist when failedAttempts is zero',
        {
          failedAttempts: this.failedAttempts,
          lockedUntil: this.lockedUntil,
        },
      );
    }

    if (this.tokenVersion < 0) {
      throw new ValidationError(
        'OUTLET_USER_INVALID_TOKEN_VERSION',
        'tokenVersion cannot be negative',
        { tokenVersion: this.tokenVersion },
      );
    }
  }

  /* ---------------------------------------------- */
  /* INTERNAL HELPERS                               */
  /* ---------------------------------------------- */

  private static normalizeEmail(email: string): string {
    if (!email) {
      throw new ValidationError(
        'OUTLET_USER_EMAIL_REQUIRED',
        'Email is required',
      );
    }

    const normalized = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new ValidationError(
        'OUTLET_USER_INVALID_EMAIL',
        'Invalid email format',
        { email },
      );
    }

    return normalized;
  }
}
