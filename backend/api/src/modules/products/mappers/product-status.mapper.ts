import { ProductStatus as PrismaProductStatus } from '@prisma/client';
import { ProductStatus } from '../../products/domain/enums/product-status.enum';

export class ProductStatusMapper {
  static toDomain(status: PrismaProductStatus): ProductStatus {
    switch (status) {
      case PrismaProductStatus.ACTIVE:
        return ProductStatus.ACTIVE;

      case PrismaProductStatus.OUT_OF_STOCK:
        return ProductStatus.OUT_OF_STOCK;

      case PrismaProductStatus.INACTIVE:
        return ProductStatus.INACTIVE;

      case PrismaProductStatus.ARCHIVED:
        return ProductStatus.ARCHIVED;

      case PrismaProductStatus.SOFT_DELETED:
        return ProductStatus.SOFT_DELETED;

      default:
        throw new Error(`Unknown Prisma ProductStatus: ${status}`);
    }
  }

  static toPrisma(status: ProductStatus): PrismaProductStatus {
    switch (status) {
      case ProductStatus.ACTIVE:
        return PrismaProductStatus.ACTIVE;

      case ProductStatus.OUT_OF_STOCK:
        return PrismaProductStatus.OUT_OF_STOCK;

      case ProductStatus.INACTIVE:
        return PrismaProductStatus.INACTIVE;

      case ProductStatus.ARCHIVED:
        return PrismaProductStatus.ARCHIVED;

      case ProductStatus.SOFT_DELETED:
        return PrismaProductStatus.SOFT_DELETED;

      default:
        throw new Error(`Unknown Domain ProductStatus: ${status}`);
    }
  }
}
