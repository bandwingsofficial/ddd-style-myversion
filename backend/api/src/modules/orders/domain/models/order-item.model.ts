import { ValidationError } from '../../../../common/errors';
import { Money } from '../value-objects/money.vo';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface OrderItemProps {
  id: string;

  orderId: string;

  productId: string;
  productName: string;
  productImage: string;

  quantity: number;

  unitPrice: Money;
  discountPrice?: Money;

  totalPrice: Money;

  createdAt: Date;
}

/* ---------------------------------------------- */
/* ENTITY                                         */
/* ---------------------------------------------- */

export class OrderItem {
  readonly id: string;

  readonly orderId: string;

  readonly productId: string;
  readonly productName: string;
  readonly productImage: string;

  readonly quantity: number;

  readonly unitPrice: Money;
  readonly discountPrice?: Money;

  readonly totalPrice: Money;

  readonly createdAt: Date;

  private constructor(props: OrderItemProps) {
    Object.assign(this, props);

    this.assertValidState();

    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORY                                       */
  /* ---------------------------------------------- */

  static create(params: {
  id: string;
  orderId: string;

  productId: string;
  productName: string;
  productImage: string;

  quantity: number;

  unitPrice: number;
  discountPrice?: number;

  now?: Date;
}): OrderItem {

  if (params.quantity <= 0) {
    throw new ValidationError(
      'INVALID_QUANTITY',
      'Quantity must be greater than zero',
    );
  }

  const unitMoney = Money.create(params.unitPrice);

  const discountMoney =
    params.discountPrice !== undefined
      ? Money.create(params.discountPrice)
      : undefined;

  const effectiveMoney = discountMoney ?? unitMoney;

  return new OrderItem({
    id: params.id,
    orderId: params.orderId,

    productId: params.productId,
    productName: params.productName,
    productImage: params.productImage,

    quantity: params.quantity,

    unitPrice: unitMoney,
    discountPrice: discountMoney,

    totalPrice: effectiveMoney.multiply(params.quantity),

    createdAt: params.now ?? new Date(),
  });
}

  static rehydrate(props: OrderItemProps): OrderItem {
    return new OrderItem(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  hasDiscount(): boolean {
    return this.discountPrice !== undefined;
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.productId) {
      throw new ValidationError(
        'ORDER_ITEM_INVALID_PRODUCT',
        'Product is required',
      );
    }

    if (!this.orderId) {
  throw new ValidationError('ORDER_ITEM_INVALID_ORDER', 'Order is required');
}

    if (this.quantity <= 0) {
      throw new ValidationError(
        'ORDER_ITEM_INVALID_QUANTITY',
        'Quantity must be greater than zero',
      );
    }

    // extra safety: total must be correct
    const expected = (this.discountPrice ?? this.unitPrice).multiply(
      this.quantity,
    );

    if (!this.totalPrice.equals(expected)) {
      throw new ValidationError(
        'ORDER_ITEM_TOTAL_MISMATCH',
        'Total price mismatch',
      );
    }
  }
}
