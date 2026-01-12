import { CategoryStatus as PrismaCategoryStatus } from '@prisma/client';
import { CategoryStatus } from '../domain/enums/category-status.enum';

export class CategoryStatusMapper {
  static toDomain(
    status: PrismaCategoryStatus,
  ): CategoryStatus {
    switch (status) {
      case PrismaCategoryStatus.ACTIVE:
        return CategoryStatus.ACTIVE;

      case PrismaCategoryStatus.INACTIVE:
        return CategoryStatus.INACTIVE;

      default:
        throw new Error(
          `Unknown Prisma CategoryStatus: ${status}`,
        );
    }
  }

  static toPrisma(
    status: CategoryStatus,
  ): PrismaCategoryStatus {
    switch (status) {
      case CategoryStatus.ACTIVE:
        return PrismaCategoryStatus.ACTIVE;

      case CategoryStatus.INACTIVE:
        return PrismaCategoryStatus.INACTIVE;

      default:
        throw new Error(
          `Unknown Domain CategoryStatus: ${status}`,
        );
    }
  }
}
