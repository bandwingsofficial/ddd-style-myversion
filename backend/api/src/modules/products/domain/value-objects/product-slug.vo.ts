import { ValidationError } from '../../../../common/errors';

export class ProductSlug {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
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

  /**
   * 🔁 Rehydrate from persistence (DB)
   * No regeneration, no mutation
   */
  static fromString(slug: string): ProductSlug {
    if (!slug || typeof slug !== 'string') {
      throw new ValidationError(
        'INVALID_PRODUCT_SLUG',
        'Persisted slug is invalid',
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
