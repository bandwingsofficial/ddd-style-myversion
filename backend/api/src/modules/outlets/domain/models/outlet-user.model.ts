// src/modules/outlets/domain/models/outlet-user.model.ts

import { ValidationError } from '../../../../common/errors';
import { createId } from '@paralleldrive/cuid2';
import { OutletUserRole } from '../enums/outlet-user-role.enum';

export interface OutletUserProps {
  id: string;
  outletId: string;
  name: string;
  phone?: string | null;
  role: OutletUserRole;
  email: string;
  passwordHash: string;
  isActive: boolean;
  failedAttempts: number;
  lockedUntil: Date | null;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export class OutletUser {
  readonly id: string;
  readonly outletId: string;
  readonly name: string;
  readonly phone?: string | null;
  readonly role: OutletUserRole;
  readonly email: string;
  readonly passwordHash: string;
  readonly isActive: boolean;
  readonly failedAttempts: number;
  readonly lockedUntil: Date | null;
  readonly tokenVersion: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: OutletUserProps) {
    this.id = props.id;
    this.outletId = props.outletId;
    this.name = props.name.trim();
    this.phone = props.phone?.trim() || null;
    this.role = props.role;
    this.email = props.email.trim().toLowerCase();
    this.passwordHash = props.passwordHash;
    this.isActive = props.isActive;
    this.failedAttempts = props.failedAttempts;
    this.lockedUntil = props.lockedUntil;
    this.tokenVersion = props.tokenVersion;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.assertValidState();
    Object.freeze(this);
  }

  static createNew(params: {
    outletId: string;
    name: string;
    phone?: string;
    role: OutletUserRole;
    email: string;
    passwordHash: string;
    now?: Date;
  }): OutletUser {
    const now = params.now ?? new Date();

    return new OutletUser({
      id: createId(),
      outletId: params.outletId,
      name: params.name,
      phone: params.phone,
      role: params.role,
      email: params.email,
      passwordHash: params.passwordHash,
      isActive: true,
      failedAttempts: 0,
      lockedUntil: null,
      tokenVersion: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: OutletUserProps): OutletUser {
    return new OutletUser(props);
  }

  resetPassword(params: { newPasswordHash: string; now?: Date }): OutletUser {
    return new OutletUser({
      ...this.toProps(),
      passwordHash: params.newPasswordHash,
      failedAttempts: 0,
      lockedUntil: null,
      tokenVersion: this.tokenVersion + 1,
      updatedAt: params.now ?? new Date(),
    });
  }

  disable(params?: { now?: Date }): OutletUser {
    if (!this.isActive) return this;

    return new OutletUser({
      ...this.toProps(),
      isActive: false,
      tokenVersion: this.tokenVersion + 1,
      updatedAt: params?.now ?? new Date(),
    });
  }

  enable(params?: { now?: Date }): OutletUser {
    if (this.isActive) return this;

    return new OutletUser({
      ...this.toProps(),
      isActive: true,
      failedAttempts: 0,
      lockedUntil: null,
      updatedAt: params?.now ?? new Date(),
    });
  }

  updateDetails(params: {
    name: string;
    phone?: string;
    role: OutletUserRole;
    outletId: string;
    now?: Date;
  }): OutletUser {
    if (!this.isActive) {
      throw new ValidationError(
        'OUTLET_USER_INACTIVE',
        'Cannot edit an inactive outlet user. Activate the user first.',
      );
    }

    return new OutletUser({
      ...this.toProps(),
      name: params.name,
      phone: params.phone,
      role: params.role,
      outletId: params.outletId,
      updatedAt: params.now ?? new Date(),
    });
  }

  private toProps(): OutletUserProps {
    return {
      id: this.id,
      outletId: this.outletId,
      name: this.name,
      phone: this.phone,
      role: this.role,
      email: this.email,
      passwordHash: this.passwordHash,
      isActive: this.isActive,
      failedAttempts: this.failedAttempts,
      lockedUntil: this.lockedUntil,
      tokenVersion: this.tokenVersion,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private assertValidState(): void {
    if (!this.name || this.name.trim().length < 2) {
      throw new ValidationError(
        'OUTLET_USER_INVALID_NAME',
        'Name must be at least 2 characters',
      );
    }

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
  }
}
