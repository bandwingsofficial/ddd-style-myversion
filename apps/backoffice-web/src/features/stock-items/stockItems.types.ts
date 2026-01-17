export type StockUnit = 'PIECE' | 'KG' | 'LITER' | 'PACKET' | 'ML' | 'GRAM';

export type StockStatus = 'ACTIVE' | 'INACTIVE';

export interface StockItem {
  id: string;
  name: string;
  unit: StockUnit;
  status: StockStatus;
  createdAt: string;
  updatedAt: string;
}
