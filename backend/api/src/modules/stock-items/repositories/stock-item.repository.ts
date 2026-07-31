import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { StockItem } from '../domain/models/stock-item.model';
import { StockItemStatus } from '../domain/enums/stock-item-status.enum';
import { StockItemStatusMapper } from '../mappers/stock-item-status.mapper';
import { UnitMapper } from '../mappers/unit.mapper';

export interface PaginatedStockItemRow {
  stockItem: StockItem;
  currentQuantity: number;
}

export interface PaginatedStockItems {
  items: PaginatedStockItemRow[];
  total: number;
}

@Injectable()
export class StockItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    stockItem: StockItem,
    tx?: PrismaTransaction,
  ): Promise<StockItem> {
    const client = tx ?? this.prisma;

    const row = await client.stockItem.create({
      data: {
        id: stockItem.id,
        name: stockItem.name,
        unit: UnitMapper.toPrisma(stockItem.unit),
        status: StockItemStatusMapper.toPrisma(stockItem.status),
        createdAt: stockItem.createdAt,
        updatedAt: stockItem.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<StockItem | null> {
    const row = await (tx ?? this.prisma).stockItem.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByName(
    name: string,
    tx?: PrismaTransaction,
    excludeId?: string,
  ): Promise<StockItem | null> {
    const row = await (tx ?? this.prisma).stockItem.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    return row ? this.toDomain(row) : null;
  }

  async existsById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<boolean> {
    const item = await (tx ?? this.prisma).stockItem.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!item;
  }

  async findAll(
    includeInactive = true,
    tx?: PrismaTransaction,
  ): Promise<StockItem[]> {
    const client = tx ?? this.prisma;

    const rows = await client.stockItem.findMany({
      where: includeInactive
        ? undefined
        : {
            status: StockItemStatusMapper.toPrisma(
              StockItemStatus.ACTIVE,
            ),
          },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    return rows.map((row) => this.toDomain(row));
  }

  async findPaginated(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<PaginatedStockItems> {
    const where = this.buildSearchWhere(params.search);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.stockItem.findMany({
        where,
        include: {
          centralInventory: {
            select: {
              availableQty: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.stockItem.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        stockItem: this.toDomain(row),
        currentQuantity: Number(row.centralInventory?.availableQty ?? 0),
      })),
      total,
    };
  }

  async update(
    stockItem: StockItem,
    tx?: PrismaTransaction,
  ): Promise<StockItem> {
    const client = tx ?? this.prisma;

    const row = await client.stockItem.update({
      where: { id: stockItem.id },
      data: {
        name: stockItem.name,
        unit: UnitMapper.toPrisma(stockItem.unit),
        status: StockItemStatusMapper.toPrisma(stockItem.status),
        updatedAt: stockItem.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  async updateStatusOnly(
    stockItem: StockItem,
    tx?: PrismaTransaction,
  ): Promise<StockItem> {
    const client = tx ?? this.prisma;

    const row = await client.stockItem.update({
      where: { id: stockItem.id },
      data: {
        status: StockItemStatusMapper.toPrisma(stockItem.status),
        updatedAt: stockItem.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  async deleteById(
    stockItemId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    await (tx ?? this.prisma).stockItem.delete({
      where: { id: stockItemId },
    });
  }

  async countCentralInventoryByStockItemId(
    stockItemId: string,
    tx?: PrismaTransaction,
  ): Promise<number> {
    return (tx ?? this.prisma).centralInventory.count({
      where: { stockItemId },
    });
  }

  async countStockTransactionsByStockItemId(
    stockItemId: string,
    tx?: PrismaTransaction,
  ): Promise<number> {
    return (tx ?? this.prisma).stockTransaction.count({
      where: { stockItemId },
    });
  }

  async countOutletStocksByStockItemId(
    stockItemId: string,
    tx?: PrismaTransaction,
  ): Promise<number> {
    return (tx ?? this.prisma).outletStock.count({
      where: { stockItemId },
    });
  }

  async deleteCentralInventoryByStockItemId(
    stockItemId: string,
    tx?: PrismaTransaction,
  ): Promise<number> {
    const client = tx ?? this.prisma;
    const result = await client.centralInventory.deleteMany({
      where: { stockItemId },
    });
    return result.count;
  }

  async deleteOutletStocksByStockItemId(
    stockItemId: string,
    tx?: PrismaTransaction,
  ): Promise<number> {
    const client = tx ?? this.prisma;
    const result = await client.outletStock.deleteMany({
      where: { stockItemId },
    });
    return result.count;
  }

  private buildSearchWhere(search?: string): Prisma.StockItemWhereInput {
    const trimmed = search?.trim();

    if (!trimmed) {
      return {};
    }

    return {
      OR: [
        {
          name: {
            contains: trimmed,
            mode: 'insensitive',
          },
        },
        {
          id: {
            contains: trimmed,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  private toDomain(row: {
    id: string;
    name: string;
    unit: any;
    status: any;
    createdAt: Date;
    updatedAt: Date;
  }): StockItem {
    return StockItem.rehydrate({
      id: row.id,
      name: row.name,
      unit: UnitMapper.toDomain(row.unit),
      status: StockItemStatusMapper.toDomain(row.status),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
