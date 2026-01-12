import { ValidationError } from '../../../../common/errors';

export class ProductName {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORY                                        */
  /* ---------------------------------------------- */

  static create(name: string): ProductName {
    if (!name || name.trim().length === 0) {
      throw new ValidationError(
        'INVALID_PRODUCT_NAME',
        'Product name is required',
      );
    }

    if (name.length > 150) {
      throw new ValidationError(
        'PRODUCT_NAME_TOO_LONG',
        'Product name must not exceed 150 characters',
      );
    }

    return new ProductName(name.trim());
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  getValue(): string {
    return this.value;
  }
}
