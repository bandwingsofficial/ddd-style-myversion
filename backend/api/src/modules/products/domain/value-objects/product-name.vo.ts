import { ValidationError } from '../../../../common/errors';

export class ProductName {
  private readonly value: string;

  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 150;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static validateInput(raw: string): string {
    const trimmed = raw.trim();

    if (!trimmed) {
      throw new ValidationError(
        'PRODUCT_NAME_REQUIRED',
        'Product name is required.',
        { errors: { productName: 'Product name is required.' } },
      );
    }

    if (raw !== trimmed) {
      throw new ValidationError(
        'PRODUCT_NAME_WHITESPACE',
        'Product name cannot have leading or trailing spaces.',
        {
          errors: {
            productName:
              'Product name cannot have leading or trailing spaces.',
          },
        },
      );
    }

    if (trimmed.length < ProductName.MIN_LENGTH) {
      throw new ValidationError(
        'PRODUCT_NAME_TOO_SHORT',
        'Product name must be at least 2 characters.',
        {
          errors: {
            productName: 'Product name must be at least 2 characters.',
          },
        },
      );
    }

    if (trimmed.length > ProductName.MAX_LENGTH) {
      throw new ValidationError(
        'PRODUCT_NAME_TOO_LONG',
        'Product name cannot exceed 150 characters.',
        {
          errors: {
            productName: 'Product name cannot exceed 150 characters.',
          },
        },
      );
    }

    return trimmed;
  }

  static create(name: string): ProductName {
    return new ProductName(ProductName.validateInput(name));
  }

  getValue(): string {
    return this.value;
  }
}
