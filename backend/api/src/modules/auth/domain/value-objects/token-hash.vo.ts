// src/modules/auth/domain/value-objects/token-hash.vo.ts

import { ValidationError } from '../../../../common/errors';

export class TokenHash {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  /**
   * Creates a TokenHash from an already-hashed value.
   * Hashing MUST be done in services, not domain.
   */
  static fromHash(hash: string): TokenHash {
    if (!hash) {
      throw new ValidationError(
        'TOKEN_HASH_REQUIRED',
        'Token hash is required',
      );
    }

    const normalized = hash.trim();

    const isValid =
      /^[a-f0-9]{64}$/i.test(normalized) || // sha256 hex
      /^[A-Za-z0-9+/]{43}={0,2}$/.test(normalized); // base64 sha256

    if (!isValid) {
      throw new ValidationError(
        'TOKEN_HASH_INVALID_FORMAT',
        'Invalid token hash format',
      );
    }

    return new TokenHash(normalized);
  }

  equals(other: TokenHash): boolean {
    return this.value === other.value;
  }

  /**
   * Explicit accessor to avoid accidental logging
   */
  getRaw(): string {
    return this.value;
  }
}
