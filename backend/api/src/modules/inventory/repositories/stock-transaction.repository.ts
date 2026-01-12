import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { StockTransaction } from '../domain/models/stock-transaction.model';

import { QuantityMapper } from '../mappers/quantity.mapper';
import { StockTransactionTypeMapper } from '../mappers/stock-transaction-type.mapper';
import { StockSourceMapper } from '../mappers/stock-source.mapper';
import { StockDestinationMapper } from '../mappers/stock-destination.mapper';

@Injectable()
export class StockTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE (APPEND ONLY)                              */
  /* ================================================= */

  async create(
    transaction: StockTransaction,
    tx?: PrismaTransaction,
  ): Promise<StockTransaction> {
    const client = tx ?? this.prisma;

    const row = await client.stockTransaction.create({
      data: {
        id: transaction.id,

        stockItemId: transaction.stockItemId,
        inventoryId: transaction.inventoryId,

        type: StockTransactionTypeMapper.toPrisma(
          transaction.type,
        ),

        quantity: QuantityMapper.toPrisma(
          transaction.quantity,
        ),

        source: StockSourceMapper.toPrisma(
          transaction.source,
        ),

        destination: StockDestinationMapper.toPrisma(
          transaction.destination,
        ),

        outletId: transaction.outletId,
        performedBy: transaction.performedBy,
        remarks: transaction.remarks,

        createdAt: transaction.createdAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<StockTransaction | null> {
    const row =
      await (tx ?? this.prisma).stockTransaction.findUnique(
        { where: { id } },
      );

    return row ? this.toDomain(row) : null;
  }

  /**
   * ADMIN – all transactions for a stock item
   */
  async findAllByStockItem(
    stockItemId: string,
    tx?: PrismaTransaction,
  ): Promise<StockTransaction[]> {
    const rows =
      await (tx ?? this.prisma).stockTransaction.findMany(
        {
          where: { stockItemId },
          orderBy: { createdAt: 'desc' },
        },
      );

    return rows.map((row) => this.toDomain(row));
  }

  /**
   * ADMIN – all transactions for an inventory item
   */
  async findAllByInventory(
    inventoryId: string,
    tx?: PrismaTransaction,
  ): Promise<StockTransaction[]> {
    const rows =
      await (tx ?? this.prisma).stockTransaction.findMany(
        {
          where: { inventoryId },
          orderBy: { createdAt: 'desc' },
        },
      );

    return rows.map((row) => this.toDomain(row));
  }

  /**
   * ADMIN – all transactions for an outlet
   */
  async findAllByOutlet(
    outletId: string,
    tx?: PrismaTransaction,
  ): Promise<StockTransaction[]> {
    const rows =
      await (tx ?? this.prisma).stockTransaction.findMany(
        {
          where: { outletId },
          orderBy: { createdAt: 'desc' },
        },
      );

    return rows.map((row) => this.toDomain(row));
  }

  /**
   * ADMIN – full audit log
   */
  async findAll(
    tx?: PrismaTransaction,
  ): Promise<StockTransaction[]> {
    const rows =
      await (tx ?? this.prisma).stockTransaction.findMany(
        {
          orderBy: { createdAt: 'desc' },
        },
      );

    return rows.map((row) => this.toDomain(row));
  }

  /* ================================================= */
  /* PRIVATE MAPPER                                   */
  /* ================================================= */

  private toDomain(row: {
    id: string;

    stockItemId: string;
    inventoryId: string;

    type: any;
    quantity: any;

    source: any;
    destination: any;

    outletId: string | null;
    performedBy: string | null;
    remarks: string | null;

    createdAt: Date;
  }): StockTransaction {
    return StockTransaction.rehydrate({
      id: row.id,

      stockItemId: row.stockItemId,
      inventoryId: row.inventoryId,

      type: StockTransactionTypeMapper.toDomain(
        row.type,
      ),

      quantity: QuantityMapper.toDomain(row.quantity),

      source: StockSourceMapper.toDomain(row.source),
      destination: StockDestinationMapper.toDomain(
        row.destination,
      ),

      outletId: row.outletId ?? undefined,
      performedBy: row.performedBy ?? undefined,
      remarks: row.remarks ?? undefined,

      createdAt: row.createdAt,
    });
  }
}
