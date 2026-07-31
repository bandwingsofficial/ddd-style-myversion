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
  /** Legacy absolute magnitude kept for backward compatibility */
  quantity: Quantity;
  previousQuantity: Quantity;
  newQuantity: Quantity;
  /** Signed delta applied during this transaction */
  quantityChange: number;

  source: StockSource;
  destination: StockDestination;

  outletId?: string;
  performedBy?: string;
  remarks?: string;

  createdAt: Date;

  /** Allows loading legacy ADJUST rows that stored ending balance instead of delta */
  skipStrictValidation?: boolean;
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
  readonly previousQuantity: Quantity;
  readonly newQuantity: Quantity;
  readonly quantityChange: number;

  readonly source: StockSource;
  readonly destination: StockDestination;

  readonly outletId?: string;
  readonly performedBy?: string;
  readonly remarks?: string;

  readonly createdAt: Date;

  private readonly skipStrictValidation: boolean;

  private constructor(props: StockTransactionProps) {
    this.skipStrictValidation = props.skipStrictValidation ?? false;
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  private static createRecord(params: {
    id: string;
    stockItemId: string;
    inventoryId: string;
    type: StockTransactionType;
    previousQuantity: Quantity;
    newQuantity: Quantity;
    quantityChange: number;
    source: StockSource;
    destination: StockDestination;
    outletId?: string;
    performedBy?: string;
    remarks?: string;
    createdAt?: Date;
  }): StockTransaction {
    return new StockTransaction({
      id: params.id,
      stockItemId: params.stockItemId,
      inventoryId: params.inventoryId,
      type: params.type,
      previousQuantity: params.previousQuantity,
      newQuantity: params.newQuantity,
      quantityChange: params.quantityChange,
      quantity: Quantity.create(Math.abs(params.quantityChange)),
      source: params.source,
      destination: params.destination,
      outletId: params.outletId,
      performedBy: params.performedBy,
      remarks: params.remarks,
      createdAt: params.createdAt ?? new Date(),
    });
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
    const change = params.quantity.getRaw();

    return StockTransaction.createRecord({
      id: params.id,
      stockItemId: params.stockItemId,
      inventoryId: params.inventoryId,
      type: StockTransactionType.INITIALIZE,
      previousQuantity: Quantity.create(0),
      newQuantity: params.quantity,
      quantityChange: change,
      source: StockSource.ADJUSTMENT,
      destination: StockDestination.CENTRAL,
      performedBy: params.performedBy,
      createdAt: params.now,
    });
  }

  static addStock(params: {
    id: string;
    stockItemId: string;
    inventoryId: string;
    quantity: Quantity;
    previousAvailable: Quantity;
    newAvailable: Quantity;
    performedBy?: string;
    remarks?: string;
    now?: Date;
  }): StockTransaction {
    return StockTransaction.createRecord({
      id: params.id,
      stockItemId: params.stockItemId,
      inventoryId: params.inventoryId,
      type: StockTransactionType.ADD,
      previousQuantity: params.previousAvailable,
      newQuantity: params.newAvailable,
      quantityChange: params.quantity.getRaw(),
      source: StockSource.ADJUSTMENT,
      destination: StockDestination.CENTRAL,
      performedBy: params.performedBy,
      remarks: params.remarks,
      createdAt: params.now,
    });
  }

  static adjust(params: {
    id: string;
    stockItemId: string;
    inventoryId: string;
    previousAvailable: Quantity;
    newAvailable: Quantity;
    performedBy?: string;
    remarks: string;
    now?: Date;
  }): StockTransaction {
    const change =
      params.newAvailable.getRaw() -
      params.previousAvailable.getRaw();

    return StockTransaction.createRecord({
      id: params.id,
      stockItemId: params.stockItemId,
      inventoryId: params.inventoryId,
      type: StockTransactionType.ADJUST,
      previousQuantity: params.previousAvailable,
      newQuantity: params.newAvailable,
      quantityChange: change,
      source: StockSource.ADJUSTMENT,
      destination: StockDestination.CENTRAL,
      performedBy: params.performedBy,
      remarks: params.remarks,
      createdAt: params.now,
    });
  }

  static transferToOutlet(params: {
    id: string;
    stockItemId: string;
    inventoryId: string;
    outletId: string;
    quantity: Quantity;
    previousAvailable: Quantity;
    newAvailable: Quantity;
    performedBy?: string;
    now?: Date;
  }): StockTransaction {
    return StockTransaction.createRecord({
      id: params.id,
      stockItemId: params.stockItemId,
      inventoryId: params.inventoryId,
      type: StockTransactionType.TRANSFER,
      previousQuantity: params.previousAvailable,
      newQuantity: params.newAvailable,
      quantityChange: -params.quantity.getRaw(),
      source: StockSource.CENTRAL,
      destination: StockDestination.OUTLET,
      outletId: params.outletId,
      performedBy: params.performedBy,
      remarks: 'Transferred from central inventory',
      createdAt: params.now,
    });
  }

  static transferReceiveAtOutlet(params: {
    id: string;
    stockItemId: string;
    inventoryId: string;
    outletId: string;
    quantity: Quantity;
    previousOutletQty: Quantity;
    newOutletQty: Quantity;
    performedBy?: string;
    now?: Date;
  }): StockTransaction {
    return StockTransaction.createRecord({
      id: params.id,
      stockItemId: params.stockItemId,
      inventoryId: params.inventoryId,
      type: StockTransactionType.TRANSFER,
      previousQuantity: params.previousOutletQty,
      newQuantity: params.newOutletQty,
      quantityChange: params.quantity.getRaw(),
      source: StockSource.CENTRAL,
      destination: StockDestination.OUTLET,
      outletId: params.outletId,
      performedBy: params.performedBy,
      remarks: 'Received at outlet',
      createdAt: params.now,
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

    if (this.skipStrictValidation) {
      return;
    }

    if (this.quantityChange === 0) {
      throw new ValidationError(
        'STOCK_TRANSACTION_INVALID_QUANTITY',
        'Transaction quantity change cannot be zero',
        {
          quantityChange: this.quantityChange,
        },
      );
    }

    if (this.quantity.getRaw() !== Math.abs(this.quantityChange)) {
      throw new ValidationError(
        'STOCK_TRANSACTION_INVALID_QUANTITY',
        'Transaction quantity must match absolute quantity change',
        {
          quantity: this.quantity.getRaw(),
          quantityChange: this.quantityChange,
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
