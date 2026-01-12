// src/modules/stock-items/services/stock-item-orchestrator.service.ts

import { Injectable } from '@nestjs/common';

import { StockItemService } from './stock-item.service';
import { StockItem } from '../domain/models/stock-item.model';
import { Unit } from '../domain/enums/unit.enum';

/**
 * Orchestrator = controller-facing layer
 * --------------------------------------------------
 * - Controllers talk ONLY to this class
 * - No domain logic
 * - No validation rules
 * - No data mutation
 * - Delegates to services
 */
@Injectable()
export class StockItemOrchestratorService {
  constructor(
    private readonly stockItemService: StockItemService,
  ) {}

  /* ================================================= */
  /* STOCK ITEM – READS                               */
  /* ================================================= */

  async getStockItemById(stockItemId: string) {
    return this.stockItemService.getById(stockItemId);
  }

  /**
   * ✅ GET ALL (ADMIN ONLY)
   */
  async getAllStockItems() {
    return this.stockItemService.getAll();
  }

  /* ================================================= */
  /* STOCK ITEM – CREATE / UPDATE / ENABLE / DISABLE  */
  /* ================================================= */

  async createStockItem(params: {
    stockItem: StockItem; // ✅ typed aggregate
  }) {
    return this.stockItemService.createStockItem(
      params.stockItem,
    );
  }

  async renameStockItem(params: {
    stockItemId: string;
    name: string;
  }) {
    return this.stockItemService.renameStockItem(params);
  }

  async disableStockItem(params: {
    stockItemId: string;
  }) {
    return this.stockItemService.disableStockItem(
      params.stockItemId,
    );
  }

  async enableStockItem(params: {
    stockItemId: string;
  }) {
    return this.stockItemService.enableStockItem(
      params.stockItemId,
    );
  }

  /* ================================================= */
  /* STOCK ITEM – UNIT                                */
  /* ================================================= */

  async changeStockItemUnit(params: {
    stockItemId: string;
    unit: Unit;
  }) {
    return this.stockItemService.changeUnit(params);
  }
}
