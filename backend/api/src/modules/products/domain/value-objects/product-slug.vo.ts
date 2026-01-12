import { ValidationError } from '../../../../common/errors';

export class ProductSlug {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORY                                        */
  /* ---------------------------------------------- */

  static fromProductName(productName: string): ProductSlug {
    if (!productName) {
      throw new ValidationError(
        'INVALID_PRODUCT_NAME',
        'Cannot generate slug without product name',
      );
    }

    const slug = productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!slug) {
      throw new ValidationError(
        'INVALID_PRODUCT_SLUG',
        'Generated slug is invalid',
      );
    }

    return new ProductSlug(slug);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  getValue(): string {
    return this.value;
  }
}
