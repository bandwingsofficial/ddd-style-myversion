// src/modules/cart/domain/models/cart-item.model.ts

import { ValidationError } from '../../../../common/errors';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface CartItemProps {
  id: string;

  cartId: string;
  productId: string;

  quantity: number;

  unitPrice: number;
  discountPrice?: number;

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

  readonly unitPrice: number;
  readonly discountPrice?: number;

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
  /* FACTORIES                                     */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPrice?: number;
    productName: string;
    productImage: string;
    now?: Date;
  }): CartItem {
    const now = params.now ?? new Date();

    return new CartItem({
      id: params.id,
      cartId: params.cartId,
      productId: params.productId,
      quantity: params.quantity,
      unitPrice: params.unitPrice,
      discountPrice: params.discountPrice,
      productName: params.productName,
      productImage: params.productImage,
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

  getEffectivePrice(): number {
    return this.discountPrice ?? this.unitPrice;
  }

  getTotalPrice(): number {
    return this.getEffectivePrice() * this.quantity;
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  increaseQuantity(by: number, now = new Date()): CartItem {
    if (by <= 0) {
      throw new ValidationError(
        'CART_ITEM_INVALID_QUANTITY',
        'Quantity increment must be greater than zero',
      );
    }

    return new CartItem({
      ...this,
      quantity: this.quantity + by,
      updatedAt: now,
    });
  }

  updateQuantity(quantity: number, now = new Date()): CartItem {
    if (quantity <= 0) {
      throw new ValidationError(
        'CART_ITEM_INVALID_QUANTITY',
        'Quantity must be greater than zero',
      );
    }

    return new CartItem({
      ...this,
      quantity,
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.productId) {
      throw new ValidationError(
        'CART_ITEM_INVALID_PRODUCT',
        'Product is required for cart item',
      );
    }

    if (this.quantity <= 0) {
      throw new ValidationError(
        'CART_ITEM_INVALID_QUANTITY',
        'Quantity must be greater than zero',
      );
    }

    if (this.unitPrice < 0) {
      throw new ValidationError(
        'CART_ITEM_INVALID_PRICE',
        'Unit price cannot be negative',
      );
    }
  }
}
