// src/modules/auth/domain/models/customer.model.ts

import { ValidationError } from '../../../../common/errors';
import { Phone } from '../value-objects/phone.vo';

/**
 * Customer aggregate root (auth perspective only).
 * Owns:
 * - phone identity
 * - blocked state
 * - tokenVersion (global logout / force reauth)
 */
export class Customer {
  readonly id: string;
  readonly phone: Phone;

  readonly isBlocked: boolean;
  readonly blockedAt?: Date;

  readonly tokenVersion: number;
  readonly createdAt: Date;

  private constructor(params: {
    id: string;
    phone: Phone;
    isBlocked: boolean;
    blockedAt?: Date;
    tokenVersion: number;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.phone = params.phone;

    this.isBlocked = params.isBlocked;
    this.blockedAt = params.blockedAt;

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
    phone: Phone;
    now?: Date;
  }): Customer {
    const now = params.now ?? new Date();

    return new Customer({
      id: params.id,
      phone: params.phone,
      isBlocked: false,
      blockedAt: undefined,
      tokenVersion: 0,
      createdAt: now,
    });
  }

  static rehydrate(params: {
    id: string;
    phone: Phone;
    isBlocked: boolean;
    blockedAt?: Date;
    tokenVersion: number;
    createdAt: Date;
  }): Customer {
    return new Customer(params);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  canLogin(): boolean {
    return !this.isBlocked;
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  block(now: Date = new Date()): Customer {
    if (this.isBlocked) return this;

    return new Customer({
      id: this.id,
      phone: this.phone,
      isBlocked: true,
      blockedAt: now,
      tokenVersion: this.tokenVersion,
      createdAt: this.createdAt,
    });
  }

  unblock(): Customer {
    if (!this.isBlocked) return this;

    return new Customer({
      id: this.id,
      phone: this.phone,
      isBlocked: false,
      blockedAt: undefined,
      tokenVersion: this.tokenVersion,
      createdAt: this.createdAt,
    });
  }

  /**
   * Used for:
   * - logout all
   * - credential reset
   * - security incidents
   */
  bumpTokenVersion(): Customer {
    return new Customer({
      id: this.id,
      phone: this.phone,
      isBlocked: this.isBlocked,
      blockedAt: this.blockedAt,
      tokenVersion: this.tokenVersion + 1,
      createdAt: this.createdAt,
    });
  }

  /* ---------------------------------------------- */
  /* DOMAIN INVARIANTS                              */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (this.isBlocked && !this.blockedAt) {
      throw new ValidationError(
        'CUSTOMER_BLOCKED_AT_REQUIRED',
        'Blocked customer must have blockedAt timestamp',
        { customerId: this.id },
      );
    }

    if (!this.isBlocked && this.blockedAt) {
      throw new ValidationError(
        'CUSTOMER_BLOCKED_AT_NOT_ALLOWED',
        'Unblocked customer cannot have blockedAt timestamp',
        { customerId: this.id },
      );
    }

    if (this.tokenVersion < 0) {
      throw new ValidationError(
        'CUSTOMER_INVALID_TOKEN_VERSION',
        'Customer tokenVersion cannot be negative',
        { tokenVersion: this.tokenVersion },
      );
    }
  }
}
