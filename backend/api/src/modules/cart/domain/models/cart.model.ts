// src/modules/cart/domain/models/cart.model.ts

import { ValidationError } from '../../../../common/errors';

import { CartStatus } from '../enums/cart-status.enum';
import { CartItem } from './cart-item.model';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface CartProps {
  id: string;

  customerId?: string;
  outletId: string;

  status: CartStatus;

  items: CartItem[];

  currency: string;

  createdAt: Date;
  updatedAt: Date;
  lockedAt?: Date;
  expiresAt?: Date;
}

/* ---------------------------------------------- */
/* ENTITY                                         */
/* ---------------------------------------------- */

export class Cart {
  readonly id: string;

  readonly customerId?: string;
  readonly outletId: string;

  readonly status: CartStatus;

  readonly items: CartItem[];

  readonly currency: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lockedAt?: Date;
  readonly expiresAt?: Date;

  private constructor(props: CartProps) {
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                     */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    customerId?: string;
    outletId: string;
    currency?: string;
    now?: Date;
  }): Cart {
    const now = params.now ?? new Date();

    return new Cart({
      id: params.id,
      customerId: params.customerId,
      outletId: params.outletId,
      status: CartStatus.ACTIVE,
      items: [],
      currency: params.currency ?? 'INR',
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: CartProps): Cart {
    return new Cart(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isActive(): boolean {
    return this.status === CartStatus.ACTIVE;
  }

  isLocked(): boolean {
    return this.status === CartStatus.LOCKED;
  }

  canBeModified(): boolean {
    return this.status === CartStatus.ACTIVE;
  }

  hasItems(): boolean {
    return this.items.length > 0;
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  addItem(item: CartItem, now = new Date()): Cart {
    if (!this.canBeModified()) {
      throw new ValidationError(
        'CART_LOCKED',
        'Cart cannot be modified once locked',
      );
    }

    const existing = this.items.find(
      i => i.productId === item.productId,
    );

    const updatedItems = existing
      ? this.items.map(i =>
          i.productId === item.productId
            ? i.increaseQuantity(item.quantity, now)
            : i,
        )
      : [...this.items, item];

    return new Cart({
      ...this,
      items: updatedItems,
      updatedAt: now,
    });
  }

  removeItem(productId: string, now = new Date()): Cart {
    if (!this.canBeModified()) {
      throw new ValidationError(
        'CART_LOCKED',
        'Cart cannot be modified once locked',
      );
    }

    return new Cart({
      ...this,
      items: this.items.filter(i => i.productId !== productId),
      updatedAt: now,
    });
  }

  lock(now = new Date()): Cart {
    if (!this.hasItems()) {
      throw new ValidationError(
        'CART_EMPTY',
        'Cannot checkout an empty cart',
      );
    }

    return new Cart({
      ...this,
      status: CartStatus.LOCKED,
      lockedAt: now,
      updatedAt: now,
    });
  }

  expire(now = new Date()): Cart {
    return new Cart({
      ...this,
      status: CartStatus.EXPIRED,
      expiresAt: now,
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.outletId) {
      throw new ValidationError(
        'CART_INVALID_OUTLET',
        'Outlet is required for cart',
      );
    }

    if (!this.currency) {
      throw new ValidationError(
        'CART_INVALID_CURRENCY',
        'Currency is required for cart',
      );
    }
  }
}
