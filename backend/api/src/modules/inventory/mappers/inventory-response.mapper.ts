import { Injectable } from '@nestjs/common';

import { CentralInventory } from '../domain/models/central-inventory.model';
import { StockTransaction } from '../domain/models/stock-transaction.model';

export interface InventoryQuantityResponse {
  value: number;
}

export interface CentralInventoryResponse {
  id: string;
  stockItemId: string;
  unit: string;
  availableQty: InventoryQuantityResponse;
  totalQty: InventoryQuantityResponse;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransactionResponse {
  id: string;
  stockItemId: string;
  inventoryId: string;
  type: string;
  quantity: InventoryQuantityResponse;
  previousQuantity: InventoryQuantityResponse;
  newQuantity: InventoryQuantityResponse;
  quantityChange: InventoryQuantityResponse;
  source: string;
  destination: string;
  outletId?: string;
  remarks?: string;
  createdAt: string;
}

@Injectable()
export class InventoryResponseMapper {
  toQuantityResponse(quantity: { getRaw(): number }): InventoryQuantityResponse {
    return { value: quantity.getRaw() };
  }

  toResponse(inventory: CentralInventory): CentralInventoryResponse {
    return {
      id: inventory.id,
      stockItemId: inventory.stockItemId,
      unit: inventory.unit,
      availableQty: this.toQuantityResponse(inventory.availableQty),
      totalQty: this.toQuantityResponse(inventory.totalQty),
      status: inventory.status,
      createdAt: inventory.createdAt.toISOString(),
      updatedAt: inventory.updatedAt.toISOString(),
    };
  }

  toResponseList(
    inventories: CentralInventory[],
  ): CentralInventoryResponse[] {
    return inventories.map((inventory) => this.toResponse(inventory));
  }

  toTransactionResponse(
    transaction: StockTransaction,
  ): StockTransactionResponse {
    return {
      id: transaction.id,
      stockItemId: transaction.stockItemId,
      inventoryId: transaction.inventoryId,
      type: transaction.type,
      quantity: this.toQuantityResponse(transaction.quantity),
      previousQuantity: this.toQuantityResponse(
        transaction.previousQuantity,
      ),
      newQuantity: this.toQuantityResponse(transaction.newQuantity),
      quantityChange: {
        value: transaction.quantityChange,
      },
      source: transaction.source,
      destination: transaction.destination,
      outletId: transaction.outletId,
      remarks: transaction.remarks,
      createdAt: transaction.createdAt.toISOString(),
    };
  }

  toTransactionResponseList(
    transactions: StockTransaction[],
  ): StockTransactionResponse[] {
    return transactions.map((transaction) =>
      this.toTransactionResponse(transaction),
    );
  }
}
