// src/modules/outlets/domain/models/outlet-user.model.ts

import { ValidationError } from '../../../../common/errors';
import { createId } from '@paralleldrive/cuid2';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface OutletUserProps {
  id: string;
  outletId: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  failedAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/* ---------------------------------------------- */
/* ENTITY                                         */
/* ---------------------------------------------- */

export class OutletUser {
  readonly id: string;
  readonly outletId: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly isActive: boolean;
  readonly failedAttempts: number;
  readonly lockedUntil: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: OutletUserProps) {
    this.id = props.id;
    this.outletId = props.outletId;
    this.email = props.email.trim().toLowerCase();
    this.passwordHash = props.passwordHash;
    this.isActive = props.isActive;
    this.failedAttempts = props.failedAttempts;
    this.lockedUntil = props.lockedUntil;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                     */
  /* ---------------------------------------------- */

  static createNew(params: {
    outletId: string;
    email: string;
    passwordHash: string;
    now?: Date;
  }): OutletUser {
    const now = params.now ?? new Date();

    return new OutletUser({
      id: createId(),
      outletId: params.outletId,
      email: params.email,
      passwordHash: params.passwordHash,
      isActive: true,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: OutletUserProps): OutletUser {
    return new OutletUser(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  resetPassword(params: {
    newPasswordHash: string;
    now?: Date;
  }): OutletUser {
    if (!this.isActive) {
      throw new ValidationError(
        'OUTLET_USER_INACTIVE',
        'Cannot reset password for inactive outlet user',
      );
    }

    return new OutletUser({
      id: this.id,
      outletId: this.outletId,
      email: this.email,
      passwordHash: params.newPasswordHash,
      isActive: this.isActive,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: this.createdAt,
      updatedAt: params.now ?? new Date(),
    });
  }

  disable(params?: { now?: Date }): OutletUser {
    if (!this.isActive) return this;

    return new OutletUser({
      id: this.id,
      outletId: this.outletId,
      email: this.email,
      passwordHash: this.passwordHash,
      isActive: false,
      failedAttempts: this.failedAttempts,
      lockedUntil: this.lockedUntil,
      createdAt: this.createdAt,
      updatedAt: params?.now ?? new Date(),
    });
  }

  enable(params?: { now?: Date }): OutletUser {
    if (this.isActive) return this;

    return new OutletUser({
      id: this.id,
      outletId: this.outletId,
      email: this.email,
      passwordHash: this.passwordHash,
      isActive: true,
      failedAttempts: 0,
      lockedUntil: null,
      createdAt: this.createdAt,
      updatedAt: params?.now ?? new Date(),
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                    */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.email || !this.email.includes('@')) {
      throw new ValidationError(
        'OUTLET_USER_INVALID_EMAIL',
        'Invalid outlet user email',
      );
    }

    if (!this.passwordHash) {
      throw new ValidationError(
        'OUTLET_USER_PASSWORD_HASH_REQUIRED',
        'Password hash is required',
      );
    }

    if (this.failedAttempts < 0) {
      throw new ValidationError(
        'OUTLET_USER_FAILED_ATTEMPTS_INVALID',
        'Failed attempts cannot be negative',
      );
    }

    if (
      this.lockedUntil &&
      isNaN(this.lockedUntil.getTime())
    ) {
      throw new ValidationError(
        'OUTLET_USER_LOCK_INVALID',
        'Invalid lockedUntil date',
      );
    }
  }
}
