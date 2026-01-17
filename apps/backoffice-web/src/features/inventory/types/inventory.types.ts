export type InventoryStatus = "ACTIVE" | "INACTIVE";

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

export interface InventoryTransaction {
  id: string;
  stockItemId: string;
  inventoryId: string;
  type: "INITIALIZE" | "ADD" | "ADJUST" | "TRANSFER";
  quantity: InventoryQuantity;
  source: string;
  destination: string;
  outletId?: string;
  remarks?: string;
  createdAt: string;
}
