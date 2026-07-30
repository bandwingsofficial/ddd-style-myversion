import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { StockItem } from '../domain/models/stock-item.model';
import { StockItemRepository } from '../repositories/stock-item.repository';
import { StockItemStatus } from '../domain/enums/stock-item-status.enum';
import { Unit } from '../domain/enums/unit.enum';

import { ValidationError } from '../../../common/errors';

import { StockItemEventsService } from '../events/stock-item-events.service';
import { ListStockItemsQueryDto } from '../dtos/list-stock-items-query.dto';

@Injectable()
export class StockItemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockItemRepo: StockItemRepository,
    private readonly stockItemEvents: StockItemEventsService,
  ) {}

  async getById(stockItemId: string): Promise<StockItem> {
    const stockItem = await this.stockItemRepo.findById(stockItemId);

    if (!stockItem) {
      throw new ValidationError(
        'STOCK_ITEM_NOT_FOUND',
        'Stock item not found',
      );
    }

    return stockItem;
  }

  async getAll(params?: {
    includeInactive?: boolean;
  }): Promise<StockItem[]> {
    return this.stockItemRepo.findAll(params?.includeInactive ?? true);
  }

  async listStockItems(query: ListStockItemsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const result = await this.stockItemRepo.findPaginated({
      page,
      limit,
      search: query.search,
    });

    return {
      items: result.items,
      page,
      limit,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / limit)),
    };
  }

  async createStockItem(stockItem: StockItem): Promise<StockItem> {
    const normalizedName = StockItem.validateNameInput(stockItem.name);

    const existing = await this.stockItemRepo.findByName(normalizedName);

    if (existing) {
      throw new ValidationError(
        'STOCK_ITEM_ALREADY_EXISTS',
        'Stock item already exists.',
        { errors: { name: 'Stock item already exists.' } },
      );
    }

    let created!: StockItem;

    await this.prisma.$transaction(async (tx) => {
      created = await this.stockItemRepo.create(
        StockItem.createNew({
          id: stockItem.id,
          name: normalizedName,
          unit: stockItem.unit,
        }),
        tx,
      );
    });

    this.stockItemEvents.emitStockItemCreated({
      stockItemId: created.id,
    });

    return created;
  }

  async updateStockItem(params: {
    stockItemId: string;
    name?: string;
    unit?: Unit;
  }): Promise<StockItem> {
    const stockItem = await this.getById(params.stockItemId);

    if (stockItem.isInactive()) {
      throw new ValidationError(
        'STOCK_ITEM_INACTIVE_UPDATE',
        'Cannot edit inactive stock item. Activate it first.',
        {
          errors: {
            name: 'Cannot edit inactive stock item. Activate it first.',
          },
        },
      );
    }

    let normalizedName: string | undefined;

    if (params.name !== undefined) {
      normalizedName = StockItem.validateNameInput(params.name);

      const duplicate = await this.stockItemRepo.findByName(
        normalizedName,
        undefined,
        stockItem.id,
      );

      if (duplicate) {
        throw new ValidationError(
          'STOCK_ITEM_ALREADY_EXISTS',
          'Stock item already exists.',
          { errors: { name: 'Stock item already exists.' } },
        );
      }
    }

    const updated = stockItem.update({
      name: normalizedName,
      unit: params.unit,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.stockItemRepo.update(updated, tx);
    });

    this.stockItemEvents.emitStockItemUpdated({
      stockItemId: updated.id,
      name: updated.name,
    });

    if (params.unit && params.unit !== stockItem.unit) {
      this.stockItemEvents.emitStockItemUnitChanged({
        stockItemId: updated.id,
        unit: updated.unit,
      });
    }

    return updated;
  }

  async updateStockItemStatus(params: {
    stockItemId: string;
    status: StockItemStatus;
  }): Promise<StockItem> {
    const stockItem = await this.getById(params.stockItemId);
    const updated = stockItem.changeStatus(params.status);

    if (updated.status === stockItem.status) {
      return stockItem;
    }

    await this.prisma.$transaction(async (tx) => {
      await this.stockItemRepo.updateStatusOnly(updated, tx);
    });

    if (updated.isActive()) {
      this.stockItemEvents.emitStockItemEnabled({
        stockItemId: updated.id,
      });
    } else {
      this.stockItemEvents.emitStockItemDisabled({
        stockItemId: updated.id,
      });
    }

    return updated;
  }

  async deleteStockItem(stockItemId: string): Promise<{ id: string }> {
    const stockItem = await this.getById(stockItemId);

    const [
      centralInventoryCount,
      transactionCount,
      outletStockCount,
    ] = await Promise.all([
      this.stockItemRepo.countCentralInventoryByStockItemId(stockItemId),
      this.stockItemRepo.countStockTransactionsByStockItemId(stockItemId),
      this.stockItemRepo.countOutletStocksByStockItemId(stockItemId),
    ]);

    const blockers: string[] = [];

    if (centralInventoryCount > 0) {
      blockers.push('central inventory records exist');
    }

    if (transactionCount > 0) {
      blockers.push('inventory transactions exist');
    }

    if (outletStockCount > 0) {
      blockers.push('outlet stock records exist');
    }

    if (blockers.length > 0) {
      throw new ValidationError(
        'STOCK_ITEM_HAS_REFERENCES',
        `Cannot delete stock item while ${blockers.join(', ')}.`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await this.stockItemRepo.deleteById(stockItemId, tx);
    });

    this.stockItemEvents.emitStockItemDeleted({
      stockItemId: stockItem.id,
    });

    return { id: stockItem.id };
  }
}
