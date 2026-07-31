export type InventoryStatus = 'ACTIVE' | 'INACTIVE';

export interface InventoryQuantity {
  value: number;
}

export interface InventoryItem {
  id: string;
  stockItemId: string;
  unit: string;
  availableQty: InventoryQuantity;
  totalQty: InventoryQuantity;
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryListItem extends InventoryItem {
  stockName: string;
  currentQuantity: number;
}

export interface InventoryTransaction {
  id: string;
  stockItemId: string;
  inventoryId: string;
  type: 'INITIALIZE' | 'ADD' | 'ADJUST' | 'TRANSFER' | string;
  quantity: InventoryQuantity;
  previousQuantity: InventoryQuantity;
  newQuantity: InventoryQuantity;
  quantityChange: InventoryQuantity;
  source: string;
  destination: string;
  outletId?: string;
  remarks?: string;
  performedBy?: string;
  createdAt: string;
}

export type InventoryAdjustmentType = 'ADD' | 'DEDUCT';

export interface InventoryFormErrors {
  stockItemId?: string;
  quantity?: string;
  adjustmentQuantity?: string;
  adjustmentType?: string;
  outletId?: string;
  newAvailableQty?: string;
  remarks?: string;
}
