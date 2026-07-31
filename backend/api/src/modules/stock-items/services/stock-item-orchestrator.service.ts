import { Injectable } from '@nestjs/common';

import { StockItemService } from './stock-item.service';
import { StockItem } from '../domain/models/stock-item.model';
import {
  StockItemResponse,
  StockItemResponseMapper,
} from '../mappers/stock-item-response.mapper';
import { ListStockItemsQueryDto } from '../dtos/list-stock-items-query.dto';
import { StockItemStatus } from '../domain/enums/stock-item-status.enum';
import { Unit } from '../domain/enums/unit.enum';

export interface PaginatedStockItemResponse {
  items: StockItemResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class StockItemOrchestratorService {
  constructor(
    private readonly stockItemService: StockItemService,
    private readonly stockItemResponseMapper: StockItemResponseMapper,
  ) {}

  async getStockItemById(stockItemId: string): Promise<StockItemResponse> {
    const stockItem = await this.stockItemService.getById(stockItemId);

    return this.stockItemResponseMapper.toResponse(stockItem);
  }

  async listStockItems(
    query: ListStockItemsQueryDto,
  ): Promise<PaginatedStockItemResponse> {
    const result = await this.stockItemService.listStockItems(query);

    return {
      items: this.stockItemResponseMapper.toResponseList(result.items),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  }

  async createStockItem(params: {
    stockItem: StockItem;
  }): Promise<StockItemResponse> {
    const stockItem = await this.stockItemService.createStockItem(
      params.stockItem,
    );

    return this.stockItemResponseMapper.toResponse(stockItem);
  }

  async updateStockItem(params: {
    stockItemId: string;
    name?: string;
    unit?: Unit;
  }): Promise<StockItemResponse> {
    const stockItem = await this.stockItemService.updateStockItem(params);

    return this.stockItemResponseMapper.toResponse(stockItem);
  }

  async updateStockItemStatus(params: {
    stockItemId: string;
    status: StockItemStatus;
  }): Promise<StockItemResponse> {
    const stockItem = await this.stockItemService.updateStockItemStatus(
      params,
    );

    return this.stockItemResponseMapper.toResponse(stockItem);
  }

  async deleteStockItem(params: {
    stockItemId: string;
    force?: boolean;
  }): Promise<{ id: string }> {
    return this.stockItemService.deleteStockItem(params.stockItemId, {
      force: params.force,
    });
  }
}
