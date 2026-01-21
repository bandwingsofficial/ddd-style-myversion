import { ProductTag as PrismaProductTag } from '@prisma/client';
import { ProductTag } from '../domain/enums/product-tag.enum';

export class ProductTagMapper {
  static toDomain(
    tags: PrismaProductTag[],
  ): ProductTag[] {
    return tags.map((tag) => {
      switch (tag) {
        case PrismaProductTag.FRESH:
          return ProductTag.FRESH;

        case PrismaProductTag.ORGANIC:
          return ProductTag.ORGANIC;

        case PrismaProductTag.NO_SUGAR:
          return ProductTag.NO_SUGAR;

        case PrismaProductTag.COLD_PRESSED:
          return ProductTag.COLD_PRESSED;

        case PrismaProductTag.NATURAL:
          return ProductTag.NATURAL;

        case PrismaProductTag.FARM_FRESH:
          return ProductTag.FARM_FRESH;

        case PrismaProductTag.PRESERVATIVE_FREE:
          return ProductTag.PRESERVATIVE_FREE;

        case PrismaProductTag.VEGAN:
          return ProductTag.VEGAN;

        default:
          throw new Error(
            `Unknown Prisma ProductTag: ${tag}`,
          );
      }
    });
  }

  static toPrisma(
    tags: ProductTag[],
  ): PrismaProductTag[] {
    return tags.map((tag) => {
      switch (tag) {
        case ProductTag.FRESH:
          return PrismaProductTag.FRESH;

        case ProductTag.ORGANIC:
          return PrismaProductTag.ORGANIC;

        case ProductTag.NO_SUGAR:
          return PrismaProductTag.NO_SUGAR;

        case ProductTag.COLD_PRESSED:
          return PrismaProductTag.COLD_PRESSED;

        case ProductTag.NATURAL:
          return PrismaProductTag.NATURAL;

        case ProductTag.FARM_FRESH:
          return PrismaProductTag.FARM_FRESH;

        case ProductTag.PRESERVATIVE_FREE:
          return PrismaProductTag.PRESERVATIVE_FREE;

        case ProductTag.VEGAN:
          return PrismaProductTag.VEGAN;

        default:
          throw new Error(
            `Unknown Domain ProductTag: ${tag}`,
          );
      }
    });
  }
}
