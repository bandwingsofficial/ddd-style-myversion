// src/modules/inventory/mappers/stock-destination.mapper.ts

import { StockDestination as PrismaStockDestination } from '@prisma/client';
import { StockDestination } from '../domain/enums/stock-destination.enum';

export class StockDestinationMapper {
  static toDomain(
    destination: PrismaStockDestination,
  ): StockDestination {
    switch (destination) {
      case PrismaStockDestination.CENTRAL:
        return StockDestination.CENTRAL;

      case PrismaStockDestination.OUTLET:
        return StockDestination.OUTLET;

      default:
        throw new Error(
          `Unknown Prisma StockDestination: ${destination}`,
        );
    }
  }

  static toPrisma(
    destination: StockDestination,
  ): PrismaStockDestination {
    switch (destination) {
      case StockDestination.CENTRAL:
        return PrismaStockDestination.CENTRAL;

      case StockDestination.OUTLET:
        return PrismaStockDestination.OUTLET;

      default:
        throw new Error(
          `Unknown Domain StockDestination: ${destination}`,
        );
    }
  }
}
