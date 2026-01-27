import { ValidationError } from '../../../../common/errors';
import { CartStatus } from '../enums/cart-status.enum';
import { CartItem } from './cart-item.model';
import { Prisma } from '@prisma/client';

type Decimal = Prisma.Decimal;

export interface CartProps {
  id: string;
  customerId?: string;
  sessionId?: string;
  outletId: string;
  status: CartStatus;
  items: CartItem[];
  currency: string;

  // 🔥 summary fields (match DB)
  subtotal: Decimal;
  discount: Decimal;
  afterDiscountTotal: Decimal;
  deliveryFee: Decimal;
  grandTotal: Decimal;
  itemCount: number;

  createdAt: Date;
  updatedAt: Date;
  lockedAt?: Date;
  expiresAt?: Date;
}

export class Cart {
  readonly id: string;
  readonly customerId?: string;
  readonly sessionId?: string;
  readonly outletId: string;
  readonly status: CartStatus;
  readonly items: readonly CartItem[];
  readonly currency: string;

  // 🔥 cached totals
  readonly subtotal: Decimal;
  readonly discount: Decimal;
  readonly afterDiscountTotal: Decimal;
  readonly deliveryFee: Decimal;
  readonly grandTotal: Decimal;
  readonly itemCount: number;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lockedAt?: Date;
  readonly expiresAt?: Date;

  private constructor(props: CartProps) {
    Object.assign(this, props);

    this.items = Object.freeze([...props.items]);

    this.assertValidState();

    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    customerId?: string;
    sessionId?: string;
    outletId: string;
    currency?: string;
    now?: Date;
  }): Cart {
    const now = params.now ?? new Date();

    return new Cart({
      id: params.id,
      customerId: params.customerId,
      sessionId: params.sessionId,
      outletId: params.outletId,
      status: CartStatus.ACTIVE,
      items: [],
      currency: params.currency ?? 'INR',

      subtotal: new Prisma.Decimal(0),
      discount: new Prisma.Decimal(0),
      afterDiscountTotal: new Prisma.Decimal(0),
      deliveryFee: new Prisma.Decimal(0),
      grandTotal: new Prisma.Decimal(0),
      itemCount: 0,

      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: CartProps): Cart {
    return new Cart(props);
  }

  /* ---------------------------------------------- */
  /* QUERIES (use cached totals, NOT recalc)        */
  /* ---------------------------------------------- */

  hasItems(): boolean {
    return this.itemCount > 0;
  }

  canBeModified(): boolean {
    return this.status === CartStatus.ACTIVE;
  }

  getSubtotalAmount(): Decimal {
    return this.subtotal;
  }
  getDiscountAmount(): Decimal {
    return this.discount;
  }
  getAfterDiscountTotal(): Decimal {
    return this.afterDiscountTotal;
  }
  getDeliveryFee(): Decimal {
    return this.deliveryFee;
  }
  getGrandTotal(): Decimal {
    return this.grandTotal;
  }

  /* ---------------------------------------------- */
  /* TRANSITIONS                                    */
  /* ---------------------------------------------- */

  lock(now = new Date()): Cart {
  if (!this.hasItems()) {
    throw new ValidationError('CART_EMPTY', 'Cannot checkout empty cart');
  }

  return new Cart({
    ...this.toProps(),
    status: CartStatus.LOCKED,
    updatedAt: now,
    lockedAt: now,
  });
}

  expire(now = new Date()): Cart {
  return new Cart({
    ...this.toProps(),
    status: CartStatus.EXPIRED,
    updatedAt: now,
    expiresAt: now,
  });
}
  /* ---------------------------------------------- */
  /* private mapper                                */
  /* ---------------------------------------------- */

private toProps(): CartProps {
  return {
    id: this.id,
    customerId: this.customerId,
    sessionId: this.sessionId,
    outletId: this.outletId,
    status: this.status,
    items: [...this.items],
    currency: this.currency,

    subtotal: this.subtotal,
    discount: this.discount,
    afterDiscountTotal: this.afterDiscountTotal,
    deliveryFee: this.deliveryFee,
    grandTotal: this.grandTotal,
    itemCount: this.itemCount,

    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    lockedAt: this.lockedAt,
    expiresAt: this.expiresAt,
  };
}

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.outletId) {
      throw new ValidationError('CART_INVALID_OUTLET', 'Outlet required');
    }

    if (!this.currency) {
      throw new ValidationError('CART_INVALID_CURRENCY', 'Currency required');
    }

    if (!this.customerId && !this.sessionId) {
      throw new ValidationError(
        'CART_OWNER_REQUIRED',
        'Either customerId or sessionId required',
      );
    }
  }
}
