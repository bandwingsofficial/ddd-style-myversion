import { ValidationError } from '../../../../common/errors';
import { createId } from '@paralleldrive/cuid2';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface OutletProductProps {
  id: string;
  outletId: string;
  productId: string;

  isAvailable: boolean;

  priceOverride: number | null;
  discountOverride: number | null;

  createdAt: Date;
  updatedAt: Date;
}

/* ---------------------------------------------- */
/* ENTITY                                         */
/* ---------------------------------------------- */

export class OutletProduct {
  readonly id: string;
  readonly outletId: string;
  readonly productId: string;

  readonly isAvailable: boolean;

  readonly priceOverride: number | null;
  readonly discountOverride: number | null;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: OutletProductProps) {
    this.id = props.id;
    this.outletId = props.outletId;
    this.productId = props.productId;

    this.isAvailable = props.isAvailable;

    this.priceOverride = props.priceOverride;
    this.discountOverride = props.discountOverride;

    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                     */
  /* ---------------------------------------------- */

  static createNew(params: {
    outletId: string;
    productId: string;
    priceOverride?: number | null;
    discountOverride?: number | null;
    now?: Date;
  }): OutletProduct {
    const now = params.now ?? new Date();

    return new OutletProduct({
      id: createId(),
      outletId: params.outletId,
      productId: params.productId,
      isAvailable: true,
      priceOverride: params.priceOverride ?? null,
      discountOverride: params.discountOverride ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: OutletProductProps): OutletProduct {
    return new OutletProduct(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  enable(params?: { now?: Date }): OutletProduct {
    if (this.isAvailable) return this;

    return new OutletProduct({
      ...this,
      isAvailable: true,
      updatedAt: params?.now ?? new Date(),
    });
  }

  disable(params?: { now?: Date }): OutletProduct {
    if (!this.isAvailable) return this;

    return new OutletProduct({
      ...this,
      isAvailable: false,
      updatedAt: params?.now ?? new Date(),
    });
  }

  updatePricing(params: {
    priceOverride?: number | null;
    discountOverride?: number | null;
    now?: Date;
  }): OutletProduct {
    return new OutletProduct({
      ...this,
      priceOverride:
        params.priceOverride !== undefined
          ? params.priceOverride
          : this.priceOverride,
      discountOverride:
        params.discountOverride !== undefined
          ? params.discountOverride
          : this.discountOverride,
      updatedAt: params.now ?? new Date(),
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                    */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.outletId) {
      throw new ValidationError(
        'OUTLET_PRODUCT_OUTLET_REQUIRED',
        'Outlet is required',
      );
    }

    if (!this.productId) {
      throw new ValidationError(
        'OUTLET_PRODUCT_PRODUCT_REQUIRED',
        'Product is required',
      );
    }

    if (this.priceOverride !== null && this.priceOverride < 0) {
      throw new ValidationError(
        'OUTLET_PRODUCT_INVALID_PRICE',
        'Price override cannot be negative',
      );
    }

    if (
      this.discountOverride !== null &&
      this.discountOverride < 0
    ) {
      throw new ValidationError(
        'OUTLET_PRODUCT_INVALID_DISCOUNT',
        'Discount override cannot be negative',
      );
    }
  }
}
