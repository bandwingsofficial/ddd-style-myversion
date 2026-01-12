import { ValidationError } from '../../../../common/errors';

import { Quantity } from '../value-objects/quantity.vo';
import { StockTransactionType } from '../enums/stock-transaction-type.enum';
import { StockSource } from '../enums/stock-source.enum';
import { StockDestination } from '../enums/stock-destination.enum';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface StockTransactionProps {
  id: string;

  stockItemId: string;
  inventoryId: string;

  type: StockTransactionType;
  quantity: Quantity;

  source: StockSource;
  destination: StockDestination;

  outletId?: string;
  performedBy?: string;
  remarks?: string;

  createdAt: Date;
}

/* ---------------------------------------------- */
/* ENTITY (IMMUTABLE RECORD)                      */
/* ---------------------------------------------- */

export class StockTransaction {
  readonly id: string;

  readonly stockItemId: string;
  readonly inventoryId: string;

  readonly type: StockTransactionType;
  readonly quantity: Quantity;

  readonly source: StockSource;
  readonly destination: StockDestination;

  readonly outletId?: string;
  readonly performedBy?: string;
  readonly remarks?: string;

  readonly createdAt: Date;

  private constructor(props: StockTransactionProps) {
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES (INTENT-REVEALING)                   */
  /* ---------------------------------------------- */

  static initialize(params: {
    id: string;
    stockItemId: string;
    inventoryId: string;
    quantity: Quantity;
    performedBy?: string;
    now?: Date;
  }): StockTransaction {
    return new StockTransaction({
      id: params.id,
      stockItemId: params.stockItemId,
      inventoryId: params.inventoryId,

      type: StockTransactionType.INITIALIZE,
      quantity: params.quantity,

      source: StockSource.ADJUSTMENT,
      destination: StockDestination.CENTRAL,

      performedBy: params.performedBy,
      createdAt: params.now ?? new Date(),
    });
  }

  static addStock(params: {
    id: string;
    stockItemId: string;
    inventoryId: string;
    quantity: Quantity;
    performedBy?: string;
    remarks?: string;
    now?: Date;
  }): StockTransaction {
    return new StockTransaction({
      id: params.id,
      stockItemId: params.stockItemId,
      inventoryId: params.inventoryId,

      type: StockTransactionType.ADD,
      quantity: params.quantity,

      source: StockSource.ADJUSTMENT,
      destination: StockDestination.CENTRAL,

      performedBy: params.performedBy,
      remarks: params.remarks,
      createdAt: params.now ?? new Date(),
    });
  }

  static adjust(params: {
    id: string;
    stockItemId: string;
    inventoryId: string;
    quantity: Quantity;
    performedBy?: string;
    remarks: string;
    now?: Date;
  }): StockTransaction {
    return new StockTransaction({
      id: params.id,
      stockItemId: params.stockItemId,
      inventoryId: params.inventoryId,

      type: StockTransactionType.ADJUST,
      quantity: params.quantity,

      source: StockSource.ADJUSTMENT,
      destination: StockDestination.CENTRAL,

      performedBy: params.performedBy,
      remarks: params.remarks,
      createdAt: params.now ?? new Date(),
    });
  }

  static transferToOutlet(params: {
    id: string;
    stockItemId: string;
    inventoryId: string;
    outletId: string;
    quantity: Quantity;
    performedBy?: string;
    now?: Date;
  }): StockTransaction {
    return new StockTransaction({
      id: params.id,
      stockItemId: params.stockItemId,
      inventoryId: params.inventoryId,

      type: StockTransactionType.TRANSFER,
      quantity: params.quantity,

      source: StockSource.CENTRAL,
      destination: StockDestination.OUTLET,

      outletId: params.outletId,
      performedBy: params.performedBy,
      createdAt: params.now ?? new Date(),
    });
  }

  /* ---------------------------------------------- */
  /* REHYDRATION (FOR REPOSITORY)                   */
  /* ---------------------------------------------- */

  static rehydrate(
    props: StockTransactionProps,
  ): StockTransaction {
    return new StockTransaction(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isTransfer(): boolean {
    return this.type === StockTransactionType.TRANSFER;
  }

  isInitialization(): boolean {
    return this.type === StockTransactionType.INITIALIZE;
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.stockItemId) {
      throw new ValidationError(
        'STOCK_TRANSACTION_INVALID_STOCK_ITEM',
        'Stock item is required for stock transaction',
      );
    }

    if (!this.inventoryId) {
      throw new ValidationError(
        'STOCK_TRANSACTION_INVALID_INVENTORY',
        'Inventory is required for stock transaction',
      );
    }

    if (this.quantity.getRaw() <= 0) {
      throw new ValidationError(
        'STOCK_TRANSACTION_INVALID_QUANTITY',
        'Transaction quantity must be greater than zero',
        {
          quantity: this.quantity.getRaw(),
        },
      );
    }

    if (
      this.type === StockTransactionType.TRANSFER &&
      !this.outletId
    ) {
      throw new ValidationError(
        'STOCK_TRANSACTION_OUTLET_REQUIRED',
        'Outlet is required for transfer transaction',
      );
    }
  }
}
