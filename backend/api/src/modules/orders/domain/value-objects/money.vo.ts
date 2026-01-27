import { ValidationError } from '../../../../common/errors';

export class Money {
  // store smallest unit (cents/paise)
  private readonly cents: number;

  private constructor(cents: number) {
    this.cents = cents;
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static create(amount: number): Money {
    if (amount === undefined || isNaN(amount)) {
      throw new ValidationError(
        'INVALID_MONEY',
        'Amount must be a valid number',
      );
    }

    if (amount < 0) {
      throw new ValidationError(
        'NEGATIVE_MONEY_NOT_ALLOWED',
        'Amount cannot be negative',
      );
    }

    // safer float → cents conversion
    const cents = Math.round((amount + Number.EPSILON) * 100);

    return new Money(cents);
  }

  static fromCents(cents: number): Money {
    if (cents < 0) {
      throw new ValidationError(
        'NEGATIVE_MONEY_NOT_ALLOWED',
        'Amount cannot be negative',
      );
    }

    return new Money(cents);
  }

  static zero(): Money {
    return new Money(0);
  }

  /* ---------------------------------------------- */
  /* DOMAIN LOGIC                                   */
  /* ---------------------------------------------- */

  add(other: Money): Money {
    return Money.fromCents(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    const result = this.cents - other.cents;

    if (result < 0) {
      throw new ValidationError(
        'NEGATIVE_RESULT',
        'Money cannot go below zero',
      );
    }

    return Money.fromCents(result);
  }

  multiply(quantity: number): Money {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new ValidationError(
        'INVALID_QUANTITY',
        'Quantity must be a non-negative integer',
      );
    }

    return Money.fromCents(this.cents * quantity);
  }

  divide(divisor: number): Money {
    if (divisor <= 0) {
      throw new ValidationError(
        'INVALID_DIVISOR',
        'Divisor must be greater than zero',
      );
    }

    return Money.fromCents(Math.round(this.cents / divisor));
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  greaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  lessThan(other: Money): boolean {
    return this.cents < other.cents;
  }

  gte(other: Money): boolean {
    return this.cents >= other.cents;
  }

  lte(other: Money): boolean {
    return this.cents <= other.cents;
  }

  isZero(): boolean {
    return this.cents === 0;
  }

  toNumber(): number {
    return this.cents / 100;
  }

  toCents(): number {
    return this.cents;
  }

  toJSON(): number {
    return this.toNumber();
  }
}
