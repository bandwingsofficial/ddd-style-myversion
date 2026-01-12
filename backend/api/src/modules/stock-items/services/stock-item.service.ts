// src/modules/stock-items/services/stock-item.service.ts

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { StockItem } from '../domain/models/stock-item.model';
import { StockItemRepository } from '../repositories/stock-item.repository';

import { ValidationError } from '../../../common/errors';

/* 🔥 EVENTS */
import { StockItemEventsService } from '../events/stock-item-events.service';
import { Unit } from '../domain/enums/unit.enum';

@Injectable()
export class StockItemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockItemRepo: StockItemRepository,
    private readonly stockItemEvents: StockItemEventsService,
  ) {}

  /* ================================================= */
  /* READS                                            */
  /* ================================================= */

  async getById(stockItemId: string): Promise<StockItem> {
    const stockItem = await this.stockItemRepo.findById(
      stockItemId,
    );

    if (!stockItem) {
      throw new ValidationError(
        'STOCK_ITEM_NOT_FOUND',
        'Stock item not found',
      );
    }

    return stockItem;
  }

  /**
   * ✅ GET ALL (ADMIN ONLY)
   */
  async getAll(): Promise<StockItem[]> {
    return this.stockItemRepo.findAll();
  }

  /* ================================================= */
  /* CREATE STOCK ITEM                                 */
  /* ================================================= */

  async createStockItem(
    stockItem: StockItem,
  ): Promise<StockItem> {
    let created!: StockItem;

    await this.prisma.$transaction(async (tx) => {
      created = await this.stockItemRepo.create(
        stockItem,
        tx,
      );
    });

    /* 🔥 EVENTS AFTER DB SUCCESS */
    this.stockItemEvents.emitStockItemCreated({
      stockItemId: created.id,
    });

    return created;
  }

  /* ================================================= */
  /* UPDATE (RENAME)                                   */
  /* ================================================= */

  async renameStockItem(params: {
    stockItemId: string;
    name: string;
  }): Promise<StockItem> {
    const stockItem = await this.stockItemRepo.findById(
      params.stockItemId,
    );

    if (!stockItem) {
      throw new ValidationError(
        'STOCK_ITEM_NOT_FOUND',
        'Stock item not found',
      );
    }

    const updated = stockItem.rename(params.name);

    await this.prisma.$transaction(async (tx) => {
      await this.stockItemRepo.update(updated, tx);
    });

    /* 🔥 EVENTS */
    this.stockItemEvents.emitStockItemUpdated({
      stockItemId: updated.id,
      name: updated.name,
    });

    return updated;
  }

  /* ================================================= */
  /* ENABLE / DISABLE                                  */
  /* ================================================= */

  async disableStockItem(stockItemId: string): Promise<{
    id: string;
    status: 'INACTIVE';
  }> {
    const stockItem = await this.stockItemRepo.findById(
      stockItemId,
    );

    if (!stockItem) {
      throw new ValidationError(
        'STOCK_ITEM_NOT_FOUND',
        'Stock item not found',
      );
    }

    if (!stockItem.isActive()) {
      return {
        id: stockItem.id,
        status: 'INACTIVE',
      };
    }

    const disabled = stockItem.disable();

    await this.prisma.$transaction(async (tx) => {
      await this.stockItemRepo.updateStatus(disabled, tx);
    });

    /* 🔥 EVENTS */
    this.stockItemEvents.emitStockItemDisabled({
      stockItemId: stockItem.id,
    });

    return {
      id: stockItem.id,
      status: 'INACTIVE',
    };
  }

  async enableStockItem(stockItemId: string): Promise<{
    id: string;
    status: 'ACTIVE';
  }> {
    const stockItem = await this.stockItemRepo.findById(
      stockItemId,
    );

    if (!stockItem) {
      throw new ValidationError(
        'STOCK_ITEM_NOT_FOUND',
        'Stock item not found',
      );
    }

    if (stockItem.isActive()) {
      return {
        id: stockItem.id,
        status: 'ACTIVE',
      };
    }

    const enabled = stockItem.enable();

    await this.prisma.$transaction(async (tx) => {
      await this.stockItemRepo.updateStatus(enabled, tx);
    });

    /* 🔥 EVENTS */
    this.stockItemEvents.emitStockItemEnabled({
      stockItemId: stockItem.id,
    });

    return {
      id: stockItem.id,
      status: 'ACTIVE',
    };
  }

  /* ================================================= */
  /* UNIT                                             */
  /* ================================================= */

  async changeUnit(params: {
    stockItemId: string;
    unit: Unit;
  }): Promise<StockItem> {
    const stockItem = await this.stockItemRepo.findById(
      params.stockItemId,
    );

    if (!stockItem) {
      throw new ValidationError(
        'STOCK_ITEM_NOT_FOUND',
        'Stock item not found',
      );
    }

    const updated = stockItem.changeUnit(params.unit);

    await this.prisma.$transaction(async (tx) => {
      await this.stockItemRepo.updateUnit(updated, tx);
    });

    /* 🔥 EVENTS */
    this.stockItemEvents.emitStockItemUnitChanged({
      stockItemId: stockItem.id,
      unit: params.unit,
    });

    return updated;
  }
}
