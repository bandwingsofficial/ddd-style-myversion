// src/modules/inventory/repositories/central-inventory.repository.ts

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { CentralInventory } from '../domain/models/central-inventory.model';

import { InventoryStatusMapper } from '../mappers/inventory-status.mapper';
import { QuantityMapper } from '../mappers/quantity.mapper';
import { UnitMapper } from '../../stock-items/mappers/unit.mapper';

@Injectable()
export class CentralInventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE (INITIALIZE INVENTORY)                     */
  /* ================================================= */

  async create(
    inventory: CentralInventory,
    tx?: PrismaTransaction,
  ): Promise<CentralInventory> {
    const client = tx ?? this.prisma;

    const row = await client.centralInventory.create({
      data: {
        id: inventory.id,
        stockItemId: inventory.stockItemId,

        unit: UnitMapper.toPrisma(inventory.unit),

        availableQty: QuantityMapper.toPrisma(
          inventory.availableQty,
        ),
        totalQty: QuantityMapper.toPrisma(
          inventory.totalQty,
        ),

        status: InventoryStatusMapper.toPrisma(
          inventory.status,
        ),

        createdAt: inventory.createdAt,
        updatedAt: inventory.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* READS                                            */
  /* ================================================= */

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<CentralInventory | null> {
    const row =
      await (tx ?? this.prisma).centralInventory.findUnique(
        { where: { id } },
      );

    return row ? this.toDomain(row) : null;
  }

  async findByStockItemId(
    stockItemId: string,
    tx?: PrismaTransaction,
  ): Promise<CentralInventory | null> {
    const row =
      await (tx ?? this.prisma).centralInventory.findUnique(
        { where: { stockItemId } },
      );

    return row ? this.toDomain(row) : null;
  }

  async existsByStockItemId(
    stockItemId: string,
    tx?: PrismaTransaction,
  ): Promise<boolean> {
    const inventory =
      await (tx ?? this.prisma).centralInventory.findUnique(
        {
          where: { stockItemId },
          select: { id: true },
        },
      );

    return !!inventory;
  }

  /**
   * ADMIN LIST – central inventory table
   */
  async findAll(
    tx?: PrismaTransaction,
  ): Promise<CentralInventory[]> {
    const rows =
      await (tx ?? this.prisma).centralInventory.findMany(
        {
          orderBy: { createdAt: 'asc' },
        },
      );

    return rows.map((row) => this.toDomain(row));
  }

  /**
   * ADMIN LIST – only ACTIVE inventory
   */
  async findAllActive(
    tx?: PrismaTransaction,
  ): Promise<CentralInventory[]> {
    const rows =
      await (tx ?? this.prisma).centralInventory.findMany(
        {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'asc' },
        },
      );

    return rows.map((row) => this.toDomain(row));
  }

  /* ================================================= */
  /* UPDATE (FULL AGGREGATE – DOMAIN CONTROLLED)       */
  /* ================================================= */

  async update(
    inventory: CentralInventory,
    tx?: PrismaTransaction,
  ): Promise<CentralInventory> {
    const client = tx ?? this.prisma;

    const row = await client.centralInventory.update({
      where: { id: inventory.id },
      data: {
        availableQty: QuantityMapper.toPrisma(
          inventory.availableQty,
        ),
        totalQty: QuantityMapper.toPrisma(
          inventory.totalQty,
        ),

        status: InventoryStatusMapper.toPrisma(
          inventory.status,
        ),

        updatedAt: inventory.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* STATUS (ENABLE / DISABLE)                         */
  /* ================================================= */

  async updateStatus(
    inventory: CentralInventory,
    tx?: PrismaTransaction,
  ): Promise<CentralInventory> {
    const client = tx ?? this.prisma;

    const row = await client.centralInventory.update({
      where: { id: inventory.id },
      data: {
        status: InventoryStatusMapper.toPrisma(
          inventory.status,
        ),
        updatedAt: inventory.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* PRIVATE MAPPER                                   */
  /* ================================================= */

  private toDomain(row: {
    id: string;
    stockItemId: string;
    unit: any;

    availableQty: any;
    totalQty: any;

    status: any;

    createdAt: Date;
    updatedAt: Date;
  }): CentralInventory {
    return CentralInventory.rehydrate({
      id: row.id,
      stockItemId: row.stockItemId,

      unit: UnitMapper.toDomain(row.unit),

      availableQty: QuantityMapper.toDomain(
        row.availableQty,
      ),
      totalQty: QuantityMapper.toDomain(row.totalQty),

      status: InventoryStatusMapper.toDomain(row.status),

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
