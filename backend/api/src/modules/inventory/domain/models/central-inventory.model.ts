import { ValidationError } from '../../../../common/errors';

import { InventoryStatus } from '../enums/inventory-status.enum';
import { Unit } from '../../../stock-items/domain/enums/unit.enum';
import { Quantity } from '../value-objects/quantity.vo';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface CentralInventoryProps {
  id: string;

  stockItemId: string;
  unit: Unit; // ✅ domain enum

  availableQty: Quantity;
  totalQty: Quantity;

  status: InventoryStatus;

  createdAt: Date;
  updatedAt: Date;
}

/* ---------------------------------------------- */
/* AGGREGATE ROOT                                 */
/* ---------------------------------------------- */

export class CentralInventory {
  readonly id: string;

  readonly stockItemId: string;
  readonly unit: Unit; // ✅ FIXED (was string)

  readonly availableQty: Quantity;
  readonly totalQty: Quantity;

  readonly status: InventoryStatus;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: CentralInventoryProps) {
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                     */
  /* ---------------------------------------------- */

  /**
   * INITIALIZE inventory for a stock item
   * Called only ONCE per StockItem
   */
  static initialize(params: {
    id: string;
    stockItemId: string;
    unit: Unit; // ✅ FIXED
    initialQty: Quantity;
    now?: Date;
  }): CentralInventory {
    const now = params.now ?? new Date();

    return new CentralInventory({
      id: params.id,
      stockItemId: params.stockItemId,
      unit: params.unit,

      availableQty: params.initialQty,
      totalQty: params.initialQty,

      status: InventoryStatus.ACTIVE,

      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Rehydrate from persistence
   */
  static rehydrate(
    props: CentralInventoryProps,
  ): CentralInventory {
    return new CentralInventory(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isActive(): boolean {
    return this.status === InventoryStatus.ACTIVE;
  }

  canAddStock(): boolean {
    return this.isActive();
  }

  canTransfer(quantity: Quantity): boolean {
    return (
      this.isActive() &&
      this.availableQty.getRaw() >= quantity.getRaw()
    );
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  /**
   * ADD stock to central inventory
   */
  addStock(
    quantity: Quantity,
    now = new Date(),
  ): CentralInventory {
    if (!this.isActive()) {
      throw new ValidationError(
        'INVENTORY_INACTIVE',
        'Cannot add stock to inactive inventory',
      );
    }

    return new CentralInventory({
      ...this,
      totalQty: this.totalQty.add(quantity),
      availableQty: this.availableQty.add(quantity),
      updatedAt: now,
    });
  }

  /**
   * MANUAL ADJUSTMENT (admin only)
   */
  adjustAvailableStock(
    newAvailableQty: Quantity,
    now = new Date(),
  ): CentralInventory {
    if (!this.isActive()) {
      throw new ValidationError(
        'INVENTORY_INACTIVE',
        'Cannot adjust inactive inventory',
      );
    }

    if (
      newAvailableQty.getRaw() >
      this.totalQty.getRaw()
    ) {
      throw new ValidationError(
        'INVALID_STOCK_ADJUSTMENT',
        'Available stock cannot exceed total stock',
        {
          available: newAvailableQty.getRaw(),
          total: this.totalQty.getRaw(),
        },
      );
    }

    return new CentralInventory({
      ...this,
      availableQty: newAvailableQty,
      updatedAt: now,
    });
  }

  /**
   * TRANSFER stock out (to outlet)
   */
  transferOut(
    quantity: Quantity,
    now = new Date(),
  ): CentralInventory {
    if (!this.canTransfer(quantity)) {
      throw new ValidationError(
        'INSUFFICIENT_STOCK',
        'Not enough stock available for transfer',
        {
          available: this.availableQty.getRaw(),
          requested: quantity.getRaw(),
        },
      );
    }

    return new CentralInventory({
      ...this,
      availableQty: this.availableQty.subtract(quantity),
      updatedAt: now,
    });
  }

  /**
   * DISABLE inventory
   */
  disable(now = new Date()): CentralInventory {
    if (this.status === InventoryStatus.INACTIVE) {
      return this;
    }

    return new CentralInventory({
      ...this,
      status: InventoryStatus.INACTIVE,
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.stockItemId) {
      throw new ValidationError(
        'INVENTORY_INVALID_STOCK_ITEM',
        'Stock item is required for inventory',
      );
    }

    if (
      this.availableQty.getRaw() >
      this.totalQty.getRaw()
    ) {
      throw new ValidationError(
        'INVENTORY_INVALID_STATE',
        'Available stock cannot exceed total stock',
      );
    }
  }
}
