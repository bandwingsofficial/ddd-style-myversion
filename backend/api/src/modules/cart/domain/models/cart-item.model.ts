import { ValidationError } from '../../../../common/errors';
import { Decimal } from '@prisma/client/runtime/library';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface CartItemProps {
  id: string;

  cartId: string;
  productId: string;

  quantity: number;

  unitPrice: Decimal;
  discountPrice?: Decimal;

  // 🔥 cached value (matches DB)
  lineTotal: Decimal;

  productName: string;
  productImage: string;

  createdAt: Date;
  updatedAt: Date;
}

/* ---------------------------------------------- */
/* ENTITY                                         */
/* ---------------------------------------------- */

export class CartItem {
  readonly id: string;

  readonly cartId: string;
  readonly productId: string;

  readonly quantity: number;

  readonly unitPrice: Decimal;
  readonly discountPrice?: Decimal;

  // 🔥 stored total
  readonly lineTotal: Decimal;

  readonly productName: string;
  readonly productImage: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: CartItemProps) {
    Object.assign(this, props);

    this.assertValidState();

    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    unitPrice: Decimal;
    discountPrice?: Decimal;
    productName: string;
    productImage: string;
    now?: Date;
  }): CartItem {
    const now = params.now ?? new Date();

    const price = params.discountPrice ?? params.unitPrice;
    const lineTotal = price.mul(new Decimal(params.quantity));

    return new CartItem({
      ...params,
      lineTotal,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: CartItemProps): CartItem {
    return new CartItem(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  getEffectivePrice(): Decimal {
    return this.discountPrice ?? this.unitPrice;
  }

  /**
   * 🔥 Prefer stored lineTotal
   * fallback for old rows/migrations
   */
  getLineTotal(): Decimal {
  return this.lineTotal;
}

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  increaseQuantity(by: number, now = new Date()): CartItem {
    if (!Number.isInteger(by) || by <= 0) {
      throw new ValidationError(
        'CART_ITEM_INVALID_QUANTITY',
        'Quantity increment must be a positive integer',
      );
    }

    const newQty = this.quantity + by;
    const newTotal = this.getEffectivePrice().mul(new Decimal(newQty));

    return new CartItem({
      ...this,
      quantity: newQty,
      lineTotal: newTotal,
      updatedAt: now,
    });
  }

  updateQuantity(quantity: number, now = new Date()): CartItem {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ValidationError(
        'CART_ITEM_INVALID_QUANTITY',
        'Quantity must be a positive integer',
      );
    }

    const newTotal = this.getEffectivePrice().mul(new Decimal(quantity));

    return new CartItem({
      ...this,
      quantity,
      lineTotal: newTotal,
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
  if (!this.cartId) {
    throw new ValidationError('CART_ITEM_INVALID_CART', 'Cart is required');
  }

  if (!this.productId) {
    throw new ValidationError('CART_ITEM_INVALID_PRODUCT', 'Product is required');
  }

  if (!Number.isInteger(this.quantity) || this.quantity <= 0) {
    throw new ValidationError(
      'CART_ITEM_INVALID_QUANTITY',
      'Quantity must be a positive integer',
    );
  }

  if (this.unitPrice.lessThan(0)) {
    throw new ValidationError(
      'CART_ITEM_INVALID_PRICE',
      'Unit price cannot be negative',
    );
  }

  if (this.discountPrice) {
    if (this.discountPrice.lessThan(0)) {
      throw new ValidationError(
        'CART_ITEM_INVALID_DISCOUNT',
        'Discount price cannot be negative',
      );
    }

    if (this.discountPrice.greaterThan(this.unitPrice)) {
      throw new ValidationError(
        'CART_ITEM_INVALID_DISCOUNT',
        'Discount price cannot exceed unit price',
      );
    }
  }

  if (this.lineTotal.lessThan(0)) {
    throw new ValidationError(
      'CART_ITEM_INVALID_TOTAL',
      'Line total cannot be negative',
    );
  }

  // 🔥 ADD HERE (final consistency check)
  const expected = this.getEffectivePrice().mul(new Decimal(this.quantity));

  if (!this.lineTotal.equals(expected)) {
    throw new ValidationError(
      'CART_ITEM_TOTAL_MISMATCH',
      'Line total mismatch with price × quantity',
    );
  }
}
}