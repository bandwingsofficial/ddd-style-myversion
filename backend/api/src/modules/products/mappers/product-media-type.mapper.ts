import { ProductMediaType as PrismaProductMediaType } from '@prisma/client';

import { ProductMediaType } from '../domain/enums/product-media-type.enum';

export class ProductMediaTypeMapper {
  static toDomain(value: PrismaProductMediaType): ProductMediaType {
    return value === PrismaProductMediaType.VIDEO
      ? ProductMediaType.VIDEO
      : ProductMediaType.IMAGE;
  }

  static toPrisma(value: ProductMediaType): PrismaProductMediaType {
    return value === ProductMediaType.VIDEO
      ? PrismaProductMediaType.VIDEO
      : PrismaProductMediaType.IMAGE;
  }
}
