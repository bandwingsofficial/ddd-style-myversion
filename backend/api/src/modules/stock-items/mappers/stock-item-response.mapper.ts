import { Injectable } from '@nestjs/common';

import { StockItem } from '../domain/models/stock-item.model';
import { PaginatedStockItemRow } from '../repositories/stock-item.repository';

export interface StockItemResponse {
  id: string;
  name: string;
  sku: string;
  unit: string;
  status: string;
  currentQuantity: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class StockItemResponseMapper {
  toResponse(stockItem: StockItem, currentQuantity = 0): StockItemResponse {
    return {
      id: stockItem.id,
      name: stockItem.name,
      sku: StockItem.toSku(stockItem.id),
      unit: stockItem.unit,
      status: stockItem.status,
      currentQuantity,
      createdAt: stockItem.createdAt.toISOString(),
      updatedAt: stockItem.updatedAt.toISOString(),
    };
  }

  toResponseList(items: PaginatedStockItemRow[]): StockItemResponse[] {
    return items.map((item) =>
      this.toResponse(item.stockItem, item.currentQuantity),
    );
  }
}
