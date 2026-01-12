import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OutletStock } from '../domain/models/outlet-stock.model';

import { QuantityMapper } from '../mappers/quantity.mapper';
import { UnitMapper } from '../../stock-items/mappers/unit.mapper';

@Injectable()
export class OutletStockRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE                                            */
  /* ================================================= */

  async create(
    outletStock: OutletStock,
    tx?: PrismaTransaction,
  ): Promise<OutletStock> {
    const client = tx ?? this.prisma;

    const row = await client.outletStock.create({
      data: {
        id: outletStock.id,

        outletId: outletStock.outletId,
        stockItemId: outletStock.stockItemId,

        unit: UnitMapper.toPrisma(outletStock.unit),

        quantity: QuantityMapper.toPrisma(
          outletStock.quantity,
        ),

        createdAt: outletStock.createdAt,
        updatedAt: outletStock.updatedAt,
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
  ): Promise<OutletStock | null> {
    const row =
      await (tx ?? this.prisma).outletStock.findUnique(
        { where: { id } },
      );

    return row ? this.toDomain(row) : null;
  }

  async findByOutletAndStockItem(
    params: {
      outletId: string;
      stockItemId: string;
    },
    tx?: PrismaTransaction,
  ): Promise<OutletStock | null> {
    const row =
      await (tx ?? this.prisma).outletStock.findUnique(
        {
          where: {
            outletId_stockItemId: {
              outletId: params.outletId,
              stockItemId: params.stockItemId,
            },
          },
        },
      );

    return row ? this.toDomain(row) : null;
  }

  async existsByOutletAndStockItem(
    params: {
      outletId: string;
      stockItemId: string;
    },
    tx?: PrismaTransaction,
  ): Promise<boolean> {
    const record =
      await (tx ?? this.prisma).outletStock.findUnique(
        {
          where: {
            outletId_stockItemId: {
              outletId: params.outletId,
              stockItemId: params.stockItemId,
            },
          },
          select: { id: true },
        },
      );

    return !!record;
  }

  /**
   * ADMIN – list all stock for an outlet
   */
  async findAllByOutlet(
    outletId: string,
    tx?: PrismaTransaction,
  ): Promise<OutletStock[]> {
    const rows =
      await (tx ?? this.prisma).outletStock.findMany(
        {
          where: { outletId },
          orderBy: { createdAt: 'asc' },
        },
      );

    return rows.map((row) => this.toDomain(row));
  }

  /* ================================================= */
  /* UPDATE (FULL AGGREGATE – DOMAIN CONTROLLED)       */
  /* ================================================= */

  async update(
    outletStock: OutletStock,
    tx?: PrismaTransaction,
  ): Promise<OutletStock> {
    const client = tx ?? this.prisma;

    const row = await client.outletStock.update({
      where: { id: outletStock.id },
      data: {
        quantity: QuantityMapper.toPrisma(
          outletStock.quantity,
        ),
        updatedAt: outletStock.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* PRIVATE MAPPER                                   */
  /* ================================================= */

  private toDomain(row: {
    id: string;

    outletId: string;
    stockItemId: string;

    unit: any;
    quantity: any;

    createdAt: Date;
    updatedAt: Date;
  }): OutletStock {
    return OutletStock.rehydrate({
      id: row.id,

      outletId: row.outletId,
      stockItemId: row.stockItemId,

      unit: UnitMapper.toDomain(row.unit),
      quantity: QuantityMapper.toDomain(row.quantity),

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
