import { ValidationError } from '../../../../common/errors';
import { Money } from '../value-objects/money.vo';
import {
  computeOrderLineTotal,
  normalizeDiscountPriceNumber,
  resolveEffectivePriceNumber,
} from '../../../../common/utils/product-pricing.util';

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

    const normalizedDiscount = normalizeDiscountPriceNumber(
      params.unitPrice,
      params.discountPrice,
    );
    const discountMoney =
      normalizedDiscount !== undefined
        ? Money.create(normalizedDiscount)
        : undefined;

    const effectiveAmount = resolveEffectivePriceNumber(
      params.unitPrice,
      normalizedDiscount,
    );
    const effectiveMoney = Money.create(effectiveAmount);

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
    return (
      this.discountPrice !== undefined &&
      this.discountPrice.lessThan(this.unitPrice)
    );
  }

  getEffectivePrice(): Money {
    if (this.discountPrice && this.discountPrice.lessThan(this.unitPrice)) {
      return this.discountPrice;
    }

    return this.unitPrice;
  }

  getLineTotal(): Money {
    return this.getEffectivePrice().multiply(this.quantity);
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
      throw new ValidationError(
        'ORDER_ITEM_INVALID_ORDER',
        'Order is required',
      );
    }

    if (this.quantity <= 0) {
      throw new ValidationError(
        'ORDER_ITEM_INVALID_QUANTITY',
        'Quantity must be greater than zero',
      );
    }

    const expectedCents = Math.round(
      computeOrderLineTotal({
        unitPrice: this.unitPrice.toNumber(),
        discountPrice: this.discountPrice?.toNumber(),
        quantity: this.quantity,
      }) * 100,
    );

    if (this.totalPrice.toCents() !== expectedCents) {
      throw new ValidationError(
        'ORDER_ITEM_TOTAL_MISMATCH',
        'Total price mismatch',
      );
    }
  }
}
