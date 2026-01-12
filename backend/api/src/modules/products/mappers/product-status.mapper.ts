import { ProductStatus as PrismaProductStatus } from '@prisma/client';
import { ProductStatus } from '../../products/domain/enums/product-status.enum';

export class ProductStatusMapper {
  static toDomain(
    status: PrismaProductStatus,
  ): ProductStatus {
    switch (status) {
      case PrismaProductStatus.ACTIVE:
        return ProductStatus.ACTIVE;

      case PrismaProductStatus.INACTIVE:
        return ProductStatus.INACTIVE;

      default:
        throw new Error(
          `Unknown Prisma ProductStatus: ${status}`,
        );
    }
  }

  static toPrisma(
    status: ProductStatus,
  ): PrismaProductStatus {
    switch (status) {
      case ProductStatus.ACTIVE:
        return PrismaProductStatus.ACTIVE;

      case ProductStatus.INACTIVE:
        return PrismaProductStatus.INACTIVE;

      default:
        throw new Error(
          `Unknown Domain ProductStatus: ${status}`,
        );
    }
  }
}
