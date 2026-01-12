// src/modules/inventory/mappers/inventory-status.mapper.ts

import { InventoryStatus as PrismaInventoryStatus } from '@prisma/client';
import { InventoryStatus } from '../domain/enums/inventory-status.enum';

export class InventoryStatusMapper {
  static toDomain(
    status: PrismaInventoryStatus,
  ): InventoryStatus {
    switch (status) {
      case PrismaInventoryStatus.ACTIVE:
        return InventoryStatus.ACTIVE;

      case PrismaInventoryStatus.INACTIVE:
        return InventoryStatus.INACTIVE;

      default:
        throw new Error(
          `Unknown Prisma InventoryStatus: ${status}`,
        );
    }
  }

  static toPrisma(
    status: InventoryStatus,
  ): PrismaInventoryStatus {
    switch (status) {
      case InventoryStatus.ACTIVE:
        return PrismaInventoryStatus.ACTIVE;

      case InventoryStatus.INACTIVE:
        return PrismaInventoryStatus.INACTIVE;

      default:
        throw new Error(
          `Unknown Domain InventoryStatus: ${status}`,
        );
    }
  }
}
