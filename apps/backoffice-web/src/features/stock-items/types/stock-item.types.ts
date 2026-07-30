export type StockUnit = 'KG' | 'GRAM' | 'LITER' | 'ML' | 'PIECE' | 'PACKET';

export type StockItemStatus = 'ACTIVE' | 'INACTIVE';

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  unit: StockUnit;
  status: StockItemStatus;
  currentQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedStockItems {
  items: StockItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StockItemFormErrors {
  name?: string;
  unit?: string;
}

export const STOCK_UNITS: { value: StockUnit; label: string }[] = [
  { value: 'PIECE', label: 'Piece' },
  { value: 'KG', label: 'Kilogram (KG)' },
  { value: 'GRAM', label: 'Gram' },
  { value: 'LITER', label: 'Liter' },
  { value: 'ML', label: 'Milliliter (ML)' },
  { value: 'PACKET', label: 'Packet' },
];
