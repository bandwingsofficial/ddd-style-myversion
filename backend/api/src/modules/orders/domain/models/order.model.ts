import { ValidationError } from '../../../../common/errors';

import { OrderStatus } from '../enums/order-status.enum';

import { Money } from '../value-objects/money.vo';
import { OrderAddress } from '../value-objects/order-address.vo';
import { OrderItem } from './order-item.model';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface OrderProps {
  id: string;

  customerId: string;
  outletId: string;

  cartId?: string;

  address: OrderAddress;

  subtotal: Money;
  discount: Money;
  afterDiscountTotal: Money;
  itemCount: number;
  deliveryFee: Money;
  grandTotal: Money;

  items: OrderItem[];

  status: OrderStatus;
  version: number;

  createdAt: Date;
  updatedAt: Date;
}

/* ---------------------------------------------- */
/* ENTITY (AGGREGATE ROOT)                        */
/* ---------------------------------------------- */

export class Order {
  readonly id: string;

  readonly customerId: string;
  readonly outletId: string;

  readonly cartId?: string;

  readonly address: OrderAddress;

  readonly subtotal: Money;
  readonly discount: Money;
  readonly afterDiscountTotal: Money;
  readonly itemCount: number;
  readonly deliveryFee: Money;
  readonly grandTotal: Money;

  readonly items: OrderItem[];

  readonly status: OrderStatus;
  readonly version: number;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  /* ---------------------------------------------- */
  /* CONSTRUCTOR (PRIVATE)                          */
  /* ---------------------------------------------- */

  private constructor(props: OrderProps) {
    Object.assign(this, {
      ...props,
      items: Object.freeze([...props.items]), // ✅ deep immutability
    });

    this.assertValidState();

    Object.freeze(this);
  }

  static createNew(params: {
  id: string;

  customerId: string;
  outletId: string;

  cartId?: string;

  address: OrderAddress;

  /* 🔥 SNAPSHOT FROM CART ONLY */
  subtotal: number;
  discount: number;
  afterDiscountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  itemCount: number;

  items: OrderItem[];

  now?: Date;
}): Order {

  const now = params.now ?? new Date();

  return new Order({
    id: params.id,

    customerId: params.customerId,
    outletId: params.outletId,
    cartId: params.cartId,

    address: params.address,

    /* 🔥 NO CALCULATIONS — JUST COPY */
    subtotal: Money.create(params.subtotal),
    discount: Money.create(params.discount),
    afterDiscountTotal: Money.create(params.afterDiscountTotal),
    deliveryFee: Money.create(params.deliveryFee),
    grandTotal: Money.create(params.grandTotal),
    itemCount: params.itemCount,

    items: params.items,

    status: OrderStatus.CREATED,
    version: 0,

    createdAt: now,
    updatedAt: now,
  });
}

  static rehydrate(props: OrderProps): Order {
    return new Order(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isCreated(): boolean {
    return this.status === OrderStatus.CREATED;
  }

  isPaid(): boolean {
    return this.status === OrderStatus.PAID;
  }

  isDelivered(): boolean {
    return this.status === OrderStatus.DELIVERED;
  }

  isFinal(): boolean {
    return [
      OrderStatus.CANCELLED,
      OrderStatus.DELIVERED,
      OrderStatus.FAILED,
    ].includes(this.status);
  }

  isActive(): boolean {
    return !this.isFinal();
  }

  canBeCancelled(): boolean {
    return [
      OrderStatus.CREATED,
      OrderStatus.PAYMENT_PENDING,
      OrderStatus.PAID,
      OrderStatus.CONFIRMED,
    ].includes(this.status);
  }

  getItemCount(): number {
  return this.itemCount;
}

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS (STRICT STATE MACHINE)       */
  /* ---------------------------------------------- */

  markPaymentPending(now = new Date()): Order {
    if (this.status !== OrderStatus.CREATED) {
      throw new ValidationError('INVALID_TRANSITION', 'Cannot move to PAYMENT_PENDING');
    }

    return new Order({
      ...this,
      status: OrderStatus.PAYMENT_PENDING,
      version: this.version + 1,
      updatedAt: now,
    });
  }

  markPaid(now = new Date()): Order {
    if (this.status !== OrderStatus.PAYMENT_PENDING) {
      throw new ValidationError('INVALID_TRANSITION', 'Cannot mark paid');
    }

    return new Order({
      ...this,
      status: OrderStatus.PAID,
      version: this.version + 1,
      updatedAt: now,
    });
  }

  confirm(now = new Date()): Order {
    if (this.status !== OrderStatus.PAID) {
      throw new ValidationError('INVALID_TRANSITION', 'Cannot confirm order');
    }

    return new Order({
      ...this,
      status: OrderStatus.CONFIRMED,
      version: this.version + 1,
      updatedAt: now,
    });
  }

  startPreparing(now = new Date()): Order {
    if (this.status !== OrderStatus.CONFIRMED) {
      throw new ValidationError('INVALID_TRANSITION', 'Cannot start preparing');
    }

    return new Order({
      ...this,
      status: OrderStatus.PREPARING,
      version: this.version + 1,
      updatedAt: now,
    });
  }

  outForDelivery(now = new Date()): Order {
    if (this.status !== OrderStatus.PREPARING) {
      throw new ValidationError('INVALID_TRANSITION', 'Cannot go out for delivery');
    }

    return new Order({
      ...this,
      status: OrderStatus.OUT_FOR_DELIVERY,
      version: this.version + 1,
      updatedAt: now,
    });
  }

  deliver(now = new Date()): Order {
    if (this.status !== OrderStatus.OUT_FOR_DELIVERY) {
      throw new ValidationError('INVALID_TRANSITION', 'Cannot deliver');
    }

    return new Order({
      ...this,
      status: OrderStatus.DELIVERED,
      version: this.version + 1,
      updatedAt: now,
    });
  }

  cancel(now = new Date()): Order {
    if (!this.canBeCancelled()) {
      throw new ValidationError(
        'ORDER_CANNOT_CANCEL',
        'Order cannot be cancelled in current state',
      );
    }

    return new Order({
      ...this,
      status: OrderStatus.CANCELLED,
      version: this.version + 1,
      updatedAt: now,
    });
  }

  fail(now = new Date()): Order {
    return new Order({
      ...this,
      status: OrderStatus.FAILED,
      version: this.version + 1,
      updatedAt: now,
    });
  }

  

  /* ---------------------------------------------- */
  /* INVARIANTS (CRITICAL BUSINESS RULES)            */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.customerId) {
      throw new ValidationError('ORDER_INVALID_CUSTOMER', 'Customer is required');
    }

    if (!this.outletId) {
      throw new ValidationError('ORDER_INVALID_OUTLET', 'Outlet is required');
    }

    if (!this.items || this.items.length === 0) {
      throw new ValidationError('ORDER_EMPTY', 'Order must contain at least one item');
    }

 /* -------- money consistency -------- */

// lineTotal already represents AFTER DISCOUNT
const itemsTotal = this.items.reduce(
  (sum, item) => sum.add(item.totalPrice),
  Money.create(0),
);

// afterDiscountTotal must equal sum(lineTotals)
if (!itemsTotal.equals(this.afterDiscountTotal)) {
  throw new ValidationError(
    'ORDER_AFTER_DISCOUNT_TOTAL_MISMATCH',
    'After discount total does not match items total',
  );
}

// afterDiscount = subtotal - discount
const expectedAfterDiscount = this.subtotal.subtract(this.discount);

if (!expectedAfterDiscount.equals(this.afterDiscountTotal)) {
  throw new ValidationError(
    'ORDER_DISCOUNT_MISMATCH',
    'After discount total mismatch',
  );
}

// grand total = afterDiscount + delivery
const expectedGrand = this.afterDiscountTotal.add(this.deliveryFee);

if (!expectedGrand.equals(this.grandTotal)) {
  throw new ValidationError(
    'ORDER_GRANDTOTAL_MISMATCH',
    'Grand total mismatch',
  );
}

// item count snapshot
const expectedCount = this.items.reduce((sum, i) => sum + i.quantity, 0);

if (expectedCount !== this.itemCount) {
  throw new ValidationError(
    'ORDER_ITEMCOUNT_MISMATCH',
    'Item count mismatch',
  );
}

if (this.grandTotal.isZero()) {
  throw new ValidationError(
    'ORDER_INVALID_GRANDTOTAL',
    'Order grand total must be greater than zero',
  );
}


  }}