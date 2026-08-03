import { ValidationError } from '../../../../common/errors';
import { normalizeDiscountPriceNumber } from '../../../../common/utils/product-pricing.util';

export class ProductPrice {
  private readonly originalPrice: number;
  private readonly discountPrice?: number;

  private constructor(originalPrice: number, discountPrice?: number) {
    this.originalPrice = originalPrice;
    this.discountPrice = discountPrice;
    Object.freeze(this);
  }

  static create(originalPrice: number, discountPrice?: number): ProductPrice {
    if (originalPrice === undefined || originalPrice <= 0) {
      throw new ValidationError(
        'INVALID_ORIGINAL_PRICE',
        'Original price must be greater than zero.',
        {
          errors: {
            originalPrice: 'Original price must be greater than zero.',
          },
        },
      );
    }

    if (discountPrice !== undefined && discountPrice < 0) {
      throw new ValidationError(
        'INVALID_DISCOUNT_PRICE',
        'Discount price cannot be negative.',
        {
          errors: {
            discountPrice: 'Discount price cannot be negative.',
          },
        },
      );
    }

    if (
      discountPrice !== undefined &&
      discountPrice > 0 &&
      discountPrice > originalPrice
    ) {
      throw new ValidationError(
        'INVALID_DISCOUNT_PRICE',
        'Discount price cannot exceed original price.',
        {
          errors: {
            discountPrice: 'Discount price cannot exceed original price.',
          },
        },
      );
    }

    const normalizedDiscount = normalizeDiscountPriceNumber(
      originalPrice,
      discountPrice,
    );

    return new ProductPrice(originalPrice, normalizedDiscount);
  }

  getOriginal(): number {
    return this.originalPrice;
  }

  getDiscount(): number | undefined {
    return this.discountPrice;
  }

  hasDiscount(): boolean {
    return this.discountPrice !== undefined;
  }

  getEffectivePrice(): number {
    return this.discountPrice ?? this.originalPrice;
  }
}
