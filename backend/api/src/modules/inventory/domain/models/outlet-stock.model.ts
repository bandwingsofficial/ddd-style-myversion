import { ValidationError } from '../../../../common/errors';

import { Quantity } from '../value-objects/quantity.vo';
import { Unit } from '../../../stock-items/domain/enums/unit.enum';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface OutletStockProps {
  id: string;

  outletId: string;
  stockItemId: string;
  unit: Unit; // ✅ domain enum

  quantity: Quantity;

  createdAt: Date;
  updatedAt: Date;
}

/* ---------------------------------------------- */
/* AGGREGATE ROOT                                 */
/* ---------------------------------------------- */

export class OutletStock {
  readonly id: string;

  readonly outletId: string;
  readonly stockItemId: string;
  readonly unit: Unit; // ✅ FIXED

  readonly quantity: Quantity;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: OutletStockProps) {
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                     */
  /* ---------------------------------------------- */

  /**
   * Create new outlet stock (first transfer)
   */
  static createNew(params: {
    id: string;
    outletId: string;
    stockItemId: string;
    unit: Unit; // ✅ FIXED
    initialQty: Quantity;
    now?: Date;
  }): OutletStock {
    const now = params.now ?? new Date();

    return new OutletStock({
      id: params.id,
      outletId: params.outletId,
      stockItemId: params.stockItemId,
      unit: params.unit,

      quantity: params.initialQty,

      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Rehydrate from persistence
   */
  static rehydrate(props: OutletStockProps): OutletStock {
    return new OutletStock(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  hasStock(): boolean {
    return this.quantity.getRaw() > 0;
  }

  getQuantity(): number {
    return this.quantity.getRaw();
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  /**
   * Add stock to outlet (from central inventory)
   */
  addStock(
    quantity: Quantity,
    now = new Date(),
  ): OutletStock {
    return new OutletStock({
      ...this,
      quantity: this.quantity.add(quantity),
      updatedAt: now,
    });
  }

  /**
   * Remove stock from outlet (future use: sales / returns)
   */
  removeStock(
    quantity: Quantity,
    now = new Date(),
  ): OutletStock {
    return new OutletStock({
      ...this,
      quantity: this.quantity.subtract(quantity),
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.outletId) {
      throw new ValidationError(
        'OUTLET_STOCK_INVALID_OUTLET',
        'Outlet is required for outlet stock',
      );
    }

    if (!this.stockItemId) {
      throw new ValidationError(
        'OUTLET_STOCK_INVALID_STOCK_ITEM',
        'Stock item is required for outlet stock',
      );
    }

    if (!this.unit) {
      throw new ValidationError(
        'OUTLET_STOCK_INVALID_UNIT',
        'Unit is required for outlet stock',
      );
    }
  }
}
