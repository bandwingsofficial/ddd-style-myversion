// src/modules/stock-items/domain/models/stock-item.model.ts

import { ValidationError } from '../../../../common/errors';
import { StockItemStatus } from '../enums/stock-item-status.enum';
import { Unit } from '../enums/unit.enum';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface StockItemProps {
  id: string;
  name: string;
  unit: Unit;
  status: StockItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

/* ---------------------------------------------- */
/* ENTITY                                         */
/* ---------------------------------------------- */

export class StockItem {
  readonly id: string;
  readonly name: string;
  readonly unit: Unit;
  readonly status: StockItemStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: StockItemProps) {
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                     */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    name: string;
    unit: Unit;
    now?: Date;
  }): StockItem {
    const now = params.now ?? new Date();

    return new StockItem({
      id: params.id,
      name: params.name,
      unit: params.unit,
      status: StockItemStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: StockItemProps): StockItem {
    return new StockItem(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isActive(): boolean {
    return this.status === StockItemStatus.ACTIVE;
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  rename(name: string, now = new Date()): StockItem {
    return new StockItem({
      ...this,
      name,
      updatedAt: now,
    });
  }

  changeUnit(unit: Unit, now = new Date()): StockItem {
    return new StockItem({
      ...this,
      unit,
      updatedAt: now,
    });
  }

  disable(now = new Date()): StockItem {
    if (this.status === StockItemStatus.INACTIVE) {
      return this;
    }

    return new StockItem({
      ...this,
      status: StockItemStatus.INACTIVE,
      updatedAt: now,
    });
  }

  enable(now = new Date()): StockItem {
    if (this.status === StockItemStatus.ACTIVE) {
      return this;
    }

    return new StockItem({
      ...this,
      status: StockItemStatus.ACTIVE,
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.name || this.name.trim().length < 2) {
      throw new ValidationError(
        'STOCK_ITEM_INVALID_NAME',
        'Stock item name must be at least 2 characters',
      );
    }

    if (!this.unit) {
      throw new ValidationError(
        'STOCK_ITEM_INVALID_UNIT',
        'Stock item unit is required',
      );
    }
  }
}
