// src/modules/inventory/domain/value-objects/quantity.vo.ts

import { ValidationError } from '../../../../common/errors';

export class Quantity {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
    Object.freeze(this);
  }

  static create(value: number): Quantity {
    if (value === null || value === undefined) {
      throw new ValidationError(
        'INVALID_QUANTITY',
        'Quantity is required',
        { value },
      );
    }

    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError(
        'INVALID_QUANTITY',
        'Quantity must be a number',
        { value },
      );
    }

    if (value < 0) {
      throw new ValidationError(
        'INVALID_QUANTITY',
        'Quantity cannot be negative',
        { value },
      );
    }

    return new Quantity(value);
  }

  add(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }

  subtract(other: Quantity): Quantity {
    if (this.value - other.value < 0) {
      throw new ValidationError(
        'INSUFFICIENT_STOCK',
        'Insufficient stock quantity',
        {
          available: this.value,
          requested: other.value,
        },
      );
    }

    return new Quantity(this.value - other.value);
  }

  equals(other?: Quantity): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  /**
   * For persistence only
   */
  getRaw(): number {
    return this.value;
  }
}
