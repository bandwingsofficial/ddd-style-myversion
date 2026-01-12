import { StockItemStatus as PrismaStockItemStatus } from '@prisma/client';
import { StockItemStatus } from '../domain/enums/stock-item-status.enum';

export class StockItemStatusMapper {
  static toDomain(
    status: PrismaStockItemStatus,
  ): StockItemStatus {
    switch (status) {
      case PrismaStockItemStatus.ACTIVE:
        return StockItemStatus.ACTIVE;

      case PrismaStockItemStatus.INACTIVE:
        return StockItemStatus.INACTIVE;

      default:
        throw new Error(
          `Unknown Prisma StockItemStatus: ${status}`,
        );
    }
  }

  static toPrisma(
    status: StockItemStatus,
  ): PrismaStockItemStatus {
    switch (status) {
      case StockItemStatus.ACTIVE:
        return PrismaStockItemStatus.ACTIVE;

      case StockItemStatus.INACTIVE:
        return PrismaStockItemStatus.INACTIVE;

      default:
        throw new Error(
          `Unknown Domain StockItemStatus: ${status}`,
        );
    }
  }
}
