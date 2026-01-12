// src/modules/auth/domain/value-objects/phone.vo.ts

import { ValidationError } from '../../../../common/errors';
import { AuthErrors } from '../../constants/auth-errors';

/**
 * Represents a normalized E.164 phone number.
 * Example: +919876543210
 */
export class Phone {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  /**
   * Creates a Phone from raw user input.
   * Normalizes to E.164 format.
   */
  static fromRaw(raw: string): Phone {
    if (!raw) {
      throw new ValidationError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid phone number',
        {
          field: 'phone',
          reason: 'missing',
        },
      );
    }

    // Remove spaces, dashes, parentheses, etc.
    const normalized = raw.replace(/[^\d+]/g, '');

    // E.164: +[country][number], max 15 digits
    if (!/^\+[1-9]\d{9,14}$/.test(normalized)) {
      throw new ValidationError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid phone number',
        {
          field: 'phone',
          raw,
          normalized,
        },
      );
    }

    return new Phone(normalized);
  }

  equals(other?: Phone): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  /**
   * Explicit accessor for persistence only.
   * ⚠️ Never log this value.
   */
  getRaw(): string {
    return this.value;
  }
}
