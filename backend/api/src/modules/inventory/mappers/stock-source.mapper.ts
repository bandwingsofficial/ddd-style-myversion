// src/modules/inventory/mappers/stock-source.mapper.ts

import { StockSource as PrismaStockSource } from '@prisma/client';
import { StockSource } from '../domain/enums/stock-source.enum';

export class StockSourceMapper {
  static toDomain(
    source: PrismaStockSource,
  ): StockSource {
    switch (source) {
      case PrismaStockSource.CENTRAL:
        return StockSource.CENTRAL;

      case PrismaStockSource.ADJUSTMENT:
        return StockSource.ADJUSTMENT;

      default:
        throw new Error(
          `Unknown Prisma StockSource: ${source}`,
        );
    }
  }

  static toPrisma(
    source: StockSource,
  ): PrismaStockSource {
    switch (source) {
      case StockSource.CENTRAL:
        return PrismaStockSource.CENTRAL;

      case StockSource.ADJUSTMENT:
        return PrismaStockSource.ADJUSTMENT;

      default:
        throw new Error(
          `Unknown Domain StockSource: ${source}`,
        );
    }
  }
}
