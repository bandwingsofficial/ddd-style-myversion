// src/modules/auth/domain/models/refresh-token.model.ts

import { ValidationError } from '../../../../common/errors';
import { TokenHash } from '../value-objects/token-hash.vo';

export class RefreshToken {
  readonly id: string;
  readonly sessionId: string;
  readonly tokenHash: TokenHash;

  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly rotatedAt?: Date;
  readonly replacedById?: string;

  private constructor(params: {
    id: string;
    sessionId: string;
    tokenHash: TokenHash;
    createdAt: Date;
    expiresAt: Date;
    rotatedAt?: Date;
    replacedById?: string;
  }) {
    this.id = params.id;
    this.sessionId = params.sessionId;
    this.tokenHash = params.tokenHash;

    this.createdAt = params.createdAt;
    this.expiresAt = params.expiresAt;
    this.rotatedAt = params.rotatedAt;
    this.replacedById = params.replacedById;

    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    sessionId: string;
    tokenHash: TokenHash;
    ttlMs: number;
    now?: Date;
  }): RefreshToken {
    const now = params.now ?? new Date();

    return new RefreshToken({
      id: params.id,
      sessionId: params.sessionId,
      tokenHash: params.tokenHash,
      createdAt: now,
      expiresAt: new Date(now.getTime() + params.ttlMs),
    });
  }

  static rehydrate(params: {
    id: string;
    sessionId: string;
    tokenHash: TokenHash;
    createdAt: Date;
    expiresAt: Date;
    rotatedAt?: Date;
    replacedById?: string;
  }): RefreshToken {
    return new RefreshToken(params);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isExpired(now: Date = new Date()): boolean {
    return now >= this.expiresAt;
  }

  isRotated(): boolean {
    return !!this.rotatedAt;
  }

  /**
   * Indicates token is no longer usable.
   */
  isInvalidated(now: Date = new Date()): boolean {
    return this.isExpired(now) || this.isRotated();
  }

  /**
   * Reuse detection signal.
   * Service decides how to react (revoke session, audit, etc).
   */
  isReuseDetected(): boolean {
    return this.isRotated();
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  rotate(params: {
    replacedById: string;
    now?: Date;
  }): RefreshToken {
    if (this.rotatedAt) return this;

    const now = params.now ?? new Date();

    return new RefreshToken({
      id: this.id,
      sessionId: this.sessionId,
      tokenHash: this.tokenHash,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      rotatedAt: now,
      replacedById: params.replacedById,
    });
  }

  /* ---------------------------------------------- */
  /* DOMAIN INVARIANTS                              */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (this.expiresAt <= this.createdAt) {
      throw new ValidationError(
        'REFRESH_TOKEN_INVALID_EXPIRY',
        'RefreshToken expiresAt must be after createdAt',
        {
          createdAt: this.createdAt,
          expiresAt: this.expiresAt,
        },
      );
    }

    if (this.rotatedAt && this.rotatedAt < this.createdAt) {
      throw new ValidationError(
        'REFRESH_TOKEN_INVALID_ROTATION_TIME',
        'RefreshToken rotatedAt cannot be before createdAt',
        {
          createdAt: this.createdAt,
          rotatedAt: this.rotatedAt,
        },
      );
    }

    if (this.rotatedAt && !this.replacedById) {
      throw new ValidationError(
        'REFRESH_TOKEN_MISSING_REPLACEMENT',
        'RefreshToken rotatedAt requires replacedById',
        {
          rotatedAt: this.rotatedAt,
        },
      );
    }
  }
}
