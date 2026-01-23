// src/modules/outlets/repositories/outlet-product.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Prisma } from '@prisma/client';

import { OutletProduct } from '../domain/models/outlet-product.model';

@Injectable()
export class OutletProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<OutletProduct | null> {
    const client = tx ?? this.prisma;

    const row = await client.outletProduct.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findOne(
    outletId: string,
    productId: string,
    tx?: PrismaTransaction,
  ): Promise<OutletProduct | null> {
    const client = tx ?? this.prisma;

    const row = await client.outletProduct.findUnique({
      where: {
        outletId_productId: {
          outletId,
          productId,
        },
      },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByOutlet(
    outletId: string,
    tx?: PrismaTransaction,
  ): Promise<OutletProduct[]> {
    const client = tx ?? this.prisma;

    const rows = await client.outletProduct.findMany({
      where: { outletId },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map(this.toDomain);
  }

  async findAvailableByOutlet(
    outletId: string,
    tx?: PrismaTransaction,
  ): Promise<OutletProduct[]> {
    const client = tx ?? this.prisma;

    const rows = await client.outletProduct.findMany({
      where: {
        outletId,
        isAvailable: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map(this.toDomain);
  }

  /* ================================================= */
  /* 🔥 NEW — PUBLIC USE CASE (JOIN PRODUCT)            */
  /* ================================================= */
  /**
   * Used by:
   * - PublicOutletController
   * - return product details with outlet assignment
   */
  async findAvailableWithProduct(
    outletId: string,
    tx?: PrismaTransaction,
  ) {
    const client = tx ?? this.prisma;

    return client.outletProduct.findMany({
      where: {
        outletId,
        isAvailable: true,
      },
      include: {
  product: {
    include: {
      galleryImages: true, // 🔥 THIS LINE
    },
  },
},
      orderBy: { createdAt: 'asc' },
    });
  }

  /* ================================================= */
  /* WRITES                                            */
  /* ================================================= */

  async create(
    entity: OutletProduct,
    tx?: PrismaTransaction,
  ): Promise<OutletProduct> {
    const client = tx ?? this.prisma;

    const row = await client.outletProduct.create({
      data: {
        id: entity.id,
        outletId: entity.outletId,
        productId: entity.productId,
        isAvailable: entity.isAvailable,
        priceOverride: entity.priceOverride,
        discountOverride: entity.discountOverride,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /**
   * Used by:
   * - enable()
   * - disable()
   */
  async updateAvailability(
    entity: OutletProduct,
    tx?: PrismaTransaction,
  ): Promise<OutletProduct> {
    const client = tx ?? this.prisma;

    const row = await client.outletProduct.update({
      where: { id: entity.id },
      data: {
        isAvailable: entity.isAvailable,
        updatedAt: entity.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /**
   * Used by:
   * - updatePricing()
   */
  async updatePricing(
    entity: OutletProduct,
    tx?: PrismaTransaction,
  ): Promise<OutletProduct> {
    const client = tx ?? this.prisma;

    const row = await client.outletProduct.update({
      where: { id: entity.id },
      data: {
        priceOverride: entity.priceOverride,
        discountOverride: entity.discountOverride,
        updatedAt: entity.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  async delete(
    outletId: string,
    productId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    await client.outletProduct.delete({
      where: {
        outletId_productId: {
          outletId,
          productId,
        },
      },
    });
  }

  /* ================================================= */
  /* PRIVATE MAPPER                                    */
  /* ================================================= */

  private toDomain = (
    row: Prisma.OutletProductGetPayload<{}>
  ): OutletProduct => {
    return OutletProduct.rehydrate({
      id: row.id,
      outletId: row.outletId,
      productId: row.productId,
      isAvailable: row.isAvailable,

      // ✅ Decimal → number safe
      priceOverride: row.priceOverride?.toNumber() ?? null,
      discountOverride: row.discountOverride?.toNumber() ?? null,

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  };
}
