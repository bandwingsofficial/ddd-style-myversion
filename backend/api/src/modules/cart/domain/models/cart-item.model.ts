import { ValidationError } from '../../../../common/errors';
import { Decimal } from '@prisma/client/runtime/library';
import {
  computeLineTotal,
  normalizeDiscountPrice,
  resolveEffectivePrice,
} from '../../../../common/utils/product-pricing.util';

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
    const discountPrice = normalizeDiscountPrice(
      params.unitPrice,
      params.discountPrice,
    );
    const lineTotal = computeLineTotal(
      params.unitPrice,
      discountPrice,
      params.quantity,
    );

    return new CartItem({
      ...params,
      discountPrice,
      lineTotal,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: CartItemProps): CartItem {
    const discountPrice = normalizeDiscountPrice(
      props.unitPrice,
      props.discountPrice,
    );
    const lineTotal = computeLineTotal(
      props.unitPrice,
      discountPrice,
      props.quantity,
    );

    return new CartItem({
      ...props,
      discountPrice,
      lineTotal,
    });
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  getEffectivePrice(): Decimal {
    return resolveEffectivePrice(this.unitPrice, this.discountPrice);
  }

  getLineTotal(): Decimal {
    return this.lineTotal;
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  withPricingSnapshot(params: {
    unitPrice: Decimal;
    discountPrice?: Decimal;
    productName?: string;
    productImage?: string;
    now?: Date;
  }): CartItem {
    const discountPrice = normalizeDiscountPrice(
      params.unitPrice,
      params.discountPrice,
    );

    return new CartItem({
      id: this.id,
      cartId: this.cartId,
      productId: this.productId,
      quantity: this.quantity,
      unitPrice: params.unitPrice,
      discountPrice,
      lineTotal: computeLineTotal(
        params.unitPrice,
        discountPrice,
        this.quantity,
      ),
      productName: params.productName ?? this.productName,
      productImage: params.productImage ?? this.productImage,
      createdAt: this.createdAt,
      updatedAt: params.now ?? new Date(),
    });
  }

  increaseQuantity(by: number, now = new Date()): CartItem {
    if (!Number.isInteger(by) || by <= 0) {
      throw new ValidationError(
        'CART_ITEM_INVALID_QUANTITY',
        'Quantity increment must be a positive integer',
      );
    }

    const newQty = this.quantity + by;

    return new CartItem({
      id: this.id,
      cartId: this.cartId,
      productId: this.productId,
      quantity: newQty,
      unitPrice: this.unitPrice,
      discountPrice: this.discountPrice,
      lineTotal: computeLineTotal(this.unitPrice, this.discountPrice, newQty),
      productName: this.productName,
      productImage: this.productImage,
      createdAt: this.createdAt,
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

    return new CartItem({
      id: this.id,
      cartId: this.cartId,
      productId: this.productId,
      quantity,
      unitPrice: this.unitPrice,
      discountPrice: this.discountPrice,
      lineTotal: computeLineTotal(this.unitPrice, this.discountPrice, quantity),
      productName: this.productName,
      productImage: this.productImage,
      createdAt: this.createdAt,
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
      throw new ValidationError(
        'CART_ITEM_INVALID_PRODUCT',
        'Product is required',
      );
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

      if (this.discountPrice.greaterThanOrEqualTo(this.unitPrice)) {
        throw new ValidationError(
          'CART_ITEM_INVALID_DISCOUNT',
          'Discount price must be below unit price',
        );
      }
    }

    if (this.lineTotal.lessThan(0)) {
      throw new ValidationError(
        'CART_ITEM_INVALID_TOTAL',
        'Line total cannot be negative',
      );
    }

    const expected = computeLineTotal(
      this.unitPrice,
      this.discountPrice,
      this.quantity,
    );

    if (!this.lineTotal.equals(expected)) {
      throw new ValidationError(
        'CART_ITEM_TOTAL_MISMATCH',
        'Line total mismatch with price × quantity',
      );
    }
  }
}
