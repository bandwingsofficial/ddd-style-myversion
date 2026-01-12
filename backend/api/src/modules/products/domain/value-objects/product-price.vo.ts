import { ValidationError } from '../../../../common/errors';

export class ProductPrice {
  private readonly originalPrice: number;
  private readonly discountPrice?: number;

  private constructor(originalPrice: number, discountPrice?: number) {
    this.originalPrice = originalPrice;
    this.discountPrice = discountPrice;
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORY                                        */
  /* ---------------------------------------------- */

  static create(
    originalPrice: number,
    discountPrice?: number,
  ): ProductPrice {
    if (originalPrice === undefined || originalPrice <= 0) {
      throw new ValidationError(
        'INVALID_ORIGINAL_PRICE',
        'Original price must be greater than zero',
      );
    }

    if (
      discountPrice !== undefined &&
      (discountPrice <= 0 || discountPrice >= originalPrice)
    ) {
      throw new ValidationError(
        'INVALID_DISCOUNT_PRICE',
        'Discount price must be less than original price',
      );
    }

    return new ProductPrice(originalPrice, discountPrice);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  getOriginal(): number {
    return this.originalPrice;
  }

  getDiscount(): number | undefined {
    return this.discountPrice;
  }

  hasDiscount(): boolean {
    return this.discountPrice !== undefined;
  }
}
