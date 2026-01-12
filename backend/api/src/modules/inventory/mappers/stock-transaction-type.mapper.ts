// src/modules/inventory/mappers/stock-transaction-type.mapper.ts

import { StockTransactionType as PrismaStockTransactionType } from '@prisma/client';
import { StockTransactionType } from '../domain/enums/stock-transaction-type.enum';

export class StockTransactionTypeMapper {
  static toDomain(
    type: PrismaStockTransactionType,
  ): StockTransactionType {
    switch (type) {
      case PrismaStockTransactionType.INITIALIZE:
        return StockTransactionType.INITIALIZE;

      case PrismaStockTransactionType.ADD:
        return StockTransactionType.ADD;

      case PrismaStockTransactionType.ADJUST:
        return StockTransactionType.ADJUST;

      case PrismaStockTransactionType.TRANSFER:
        return StockTransactionType.TRANSFER;

      default:
        throw new Error(
          `Unknown Prisma StockTransactionType: ${type}`,
        );
    }
  }

  static toPrisma(
    type: StockTransactionType,
  ): PrismaStockTransactionType {
    switch (type) {
      case StockTransactionType.INITIALIZE:
        return PrismaStockTransactionType.INITIALIZE;

      case StockTransactionType.ADD:
        return PrismaStockTransactionType.ADD;

      case StockTransactionType.ADJUST:
        return PrismaStockTransactionType.ADJUST;

      case StockTransactionType.TRANSFER:
        return PrismaStockTransactionType.TRANSFER;

      default:
        throw new Error(
          `Unknown Domain StockTransactionType: ${type}`,
        );
    }
  }
}
