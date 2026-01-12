// src/modules/stock-items/repositories/stock-item.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { StockItem } from '../domain/models/stock-item.model';
import { StockItemStatus } from '../domain/enums/stock-item-status.enum';

import { StockItemStatusMapper } from '../mappers/stock-item-status.mapper';
import { UnitMapper } from '../mappers/unit.mapper';

@Injectable()
export class StockItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE                                           */
  /* ================================================= */

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
        status: StockItemStatusMapper.toPrisma(
          stockItem.status,
        ),
        createdAt: stockItem.createdAt,
        updatedAt: stockItem.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* READ (SINGLE)                                    */
  /* ================================================= */

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<StockItem | null> {
    const row = await (tx ?? this.prisma).stockItem.findUnique({
      where: { id },
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

  /* ================================================= */
  /* READ (LIST – ADMIN ONLY)                          */
  /* ================================================= */

  async findAll(
    tx?: PrismaTransaction,
  ): Promise<StockItem[]> {
    const rows = await (tx ?? this.prisma).stockItem.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rows.map((row) => this.toDomain(row));
  }

  /* ================================================= */
  /* UPDATE (FULL AGGREGATE)                           */
  /* ================================================= */

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
        status: StockItemStatusMapper.toPrisma(
          stockItem.status,
        ),
        updatedAt: stockItem.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* STATUS (ENABLE / DISABLE)                         */
  /* ================================================= */

  async updateStatus(
    stockItem: StockItem,
    tx?: PrismaTransaction,
  ): Promise<StockItem> {
    const client = tx ?? this.prisma;

    const row = await client.stockItem.update({
      where: { id: stockItem.id },
      data: {
        status: StockItemStatusMapper.toPrisma(
          stockItem.status,
        ),
        updatedAt: stockItem.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* UNIT CHANGE                                      */
  /* ================================================= */

  async updateUnit(
    stockItem: StockItem,
    tx?: PrismaTransaction,
  ): Promise<StockItem> {
    const client = tx ?? this.prisma;

    const row = await client.stockItem.update({
      where: { id: stockItem.id },
      data: {
        unit: UnitMapper.toPrisma(stockItem.unit),
        updatedAt: stockItem.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* PRIVATE MAPPER                                   */
  /* ================================================= */

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
