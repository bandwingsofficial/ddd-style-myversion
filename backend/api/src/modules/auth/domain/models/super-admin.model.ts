// src/modules/auth/domain/models/super-admin.model.ts

import { ValidationError } from '../../../../common/errors';

/**
 * SuperAdmin aggregate (auth perspective).
 * Highest privilege actor.
 * - Email + password
 * - Mandatory MFA (TOTP)
 * - Global token invalidation via tokenVersion
 */
export class SuperAdmin {
  readonly id: string;
  readonly email: string;

  readonly passwordHash: string;
  readonly totpSecret?: string;
  readonly mfaEnabled: boolean;

  readonly isActive: boolean;
  readonly tokenVersion: number;
  readonly createdAt: Date;

  private constructor(params: {
    id: string;
    email: string;
    passwordHash: string;
    totpSecret?: string;
    mfaEnabled: boolean;
    isActive: boolean;
    tokenVersion: number;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.email = SuperAdmin.normalizeEmail(params.email);

    this.passwordHash = params.passwordHash;
    this.totpSecret = params.totpSecret;
    this.mfaEnabled = params.mfaEnabled;

    this.isActive = params.isActive;
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
    email: string;
    passwordHash: string;
    totpSecret: string;
    now?: Date;
  }): SuperAdmin {
    const now = params.now ?? new Date();

    return new SuperAdmin({
      id: params.id,
      email: params.email,
      passwordHash: params.passwordHash,
      totpSecret: params.totpSecret,
      mfaEnabled: true,
      isActive: true,
      tokenVersion: 0,
      createdAt: now,
    });
  }

  static rehydrate(params: {
    id: string;
    email: string;
    passwordHash: string;
    totpSecret?: string;
    mfaEnabled: boolean;
    isActive: boolean;
    tokenVersion: number;
    createdAt: Date;
  }): SuperAdmin {
    return new SuperAdmin(params);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  canLogin(): boolean {
    return this.isActive;
  }

  isMfaRequired(): boolean {
    return this.mfaEnabled;
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  enableMfa(totpSecret: string): SuperAdmin {
    if (this.mfaEnabled) return this;

    return new SuperAdmin({
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      totpSecret,
      mfaEnabled: true,
      isActive: this.isActive,
      tokenVersion: this.tokenVersion,
      createdAt: this.createdAt,
    });
  }

  disableMfa(): SuperAdmin {
    if (!this.mfaEnabled) return this;

    return new SuperAdmin({
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      totpSecret: undefined,
      mfaEnabled: false,
      isActive: this.isActive,
      tokenVersion: this.tokenVersion,
      createdAt: this.createdAt,
    });
  }

  deactivate(): SuperAdmin {
    if (!this.isActive) return this;

    return new SuperAdmin({
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      totpSecret: this.totpSecret,
      mfaEnabled: this.mfaEnabled,
      isActive: false,
      tokenVersion: this.tokenVersion,
      createdAt: this.createdAt,
    });
  }

  bumpTokenVersion(): SuperAdmin {
    return new SuperAdmin({
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      totpSecret: this.totpSecret,
      mfaEnabled: this.mfaEnabled,
      isActive: this.isActive,
      tokenVersion: this.tokenVersion + 1,
      createdAt: this.createdAt,
    });
  }

  /* ---------------------------------------------- */
  /* DOMAIN INVARIANTS                              */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (this.tokenVersion < 0) {
      throw new ValidationError(
        'SUPER_ADMIN_INVALID_TOKEN_VERSION',
        'SuperAdmin tokenVersion cannot be negative',
        { tokenVersion: this.tokenVersion },
      );
    }

    if (this.mfaEnabled && !this.totpSecret) {
      throw new ValidationError(
        'SUPER_ADMIN_MFA_SECRET_REQUIRED',
        'MFA-enabled SuperAdmin must have totpSecret',
        { superAdminId: this.id },
      );
    }

    if (!this.mfaEnabled && this.totpSecret) {
      throw new ValidationError(
        'SUPER_ADMIN_MFA_SECRET_NOT_ALLOWED',
        'Non-MFA SuperAdmin must not have totpSecret',
        { superAdminId: this.id },
      );
    }
  }

  /* ---------------------------------------------- */
  /* INTERNAL HELPERS                               */
  /* ---------------------------------------------- */

  private static normalizeEmail(email: string): string {
    if (!email) {
      throw new ValidationError(
        'SUPER_ADMIN_EMAIL_REQUIRED',
        'Email is required',
      );
    }

    const normalized = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new ValidationError(
        'SUPER_ADMIN_INVALID_EMAIL',
        'Invalid email format',
        { email },
      );
    }

    return normalized;
  }
}
