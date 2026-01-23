import { Injectable } from '@nestjs/common';
import {
  Prisma,
  UnitType as PrismaUnitType,
  ProductTag as PrismaProductTag,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Product } from '../domain/models/product.model';

import { ProductStatus } from '../domain/enums/product-status.enum';
import { ProductStatusMapper } from '../mappers/product-status.mapper';
import { ProductTagMapper } from '../mappers/product-tag.mapper';
import { UnitTypeMapper } from '../mappers/unit-type.mapper';

import { ProductName } from '../domain/value-objects/product-name.vo';
import { ProductSlug } from '../domain/value-objects/product-slug.vo';
import { ProductPrice } from '../domain/value-objects/product-price.vo';
import { ProductImages } from '../domain/value-objects/product-images.vo';
import { ProductTrendState } from '../domain/value-objects/product-trend-state.vo';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* READ – LIST                                      */
  /* ================================================= */

  async findAll(
  context: 'admin' | 'public' = 'public',
  tx?: PrismaTransaction,
): Promise<Product[]> {
  const client = tx ?? this.prisma;

  const where =
    context === 'admin'
      ? {}
      : {
          status: ProductStatusMapper.toPrisma(
            ProductStatus.ACTIVE,
          ),
        };

  const rows = await client.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { galleryImages: true },
  });

  return rows.map((row) => this.toDomain(row));
}

  async findAllWithCategory(): Promise<
  {
    product: Product;
    category: { id: string; name: string };
  }[]
> {
  const rows = await this.prisma.product.findMany({
    where: {
      status: ProductStatusMapper.toPrisma(
        ProductStatus.ACTIVE,
      ),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      galleryImages: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    product: this.toDomain(row),
    category: row.category,
  }));
}

async findBySlugWithCategory(
  slug: string,
): Promise<{
  product: Product;
  category: { id: string; name: string };
} | null> {
  const row = await this.prisma.product.findUnique({
    where: { slug },
    include: {
      galleryImages: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!row) return null;

  return {
    product: this.toDomain(row),
    category: row.category,
  };
}

async findByIdWithCategory(
  id: string,
): Promise<{
  product: Product;
  category: { id: string; name: string };
} | null> {
  const row = await this.prisma.product.findUnique({
    where: { id },
    include: {
      galleryImages: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!row) return null;

  return {
    product: this.toDomain(row),
    category: row.category,
  };
}

  /* ================================================= */
  /* READ – SINGLE                                    */
  /* ================================================= */

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<Product | null> {
    const row = await (tx ?? this.prisma).product.findUnique({
      where: { id },
      include: { galleryImages: true },
    });

    return row ? this.toDomain(row) : null;
  }

  async findBySlug(
    slug: string,
    tx?: PrismaTransaction,
  ): Promise<Product | null> {
    const row = await (tx ?? this.prisma).product.findUnique({
      where: { slug },
      include: { galleryImages: true },
    });

    return row ? this.toDomain(row) : null;
  }

  /* ================================================= */
  /* CREATE (WRITE ONCE – CATEGORY PATTERN)            */
  /* ================================================= */

  async create(
    params: { product: Product },
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const client = tx ?? this.prisma;
    const { product } = params;

    const row = await client.product.create({
      data: {
        id: product.id,

        categoryId: product.categoryId,
        stockItemId: product.stockItemId,

        productName: product.name.getValue(),
        slug: product.slug.getValue(),

        shortDescription: product.shortDescription,
        longDescription: product.longDescription,

        originalPrice: product.price.getOriginal(),
        discountPrice: product.price.getDiscount(),

        mainImage: product.images.getMain(),

        unitValue: product.unitValue,
        unitType: UnitTypeMapper.toPrisma(product.unitType),

        ratingAverage: product.ratingAverage ?? 0,
        ratingCount: product.ratingCount ?? 0,

        tags: ProductTagMapper.toPrisma(product.tags),

        isTrending: product.trendState.getRaw(),
        status: ProductStatusMapper.toPrisma(product.status),

        createdBy: product.createdBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,

        galleryImages: {
          create: product.images.getGallery().map(
            (imageUrl, index) => ({
              imageUrl,
              sortOrder: index,
            }),
          ),
        },
      } satisfies Prisma.ProductUncheckedCreateInput,
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* UPDATE – DETAILS                                 */
  /* ================================================= */

  async updateDetails(
    product: Product,
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const client = tx ?? this.prisma;

    const row = await client.product.update({
      where: { id: product.id },
      data: {
        productName: product.name.getValue(),
        slug: product.slug.getValue(),
        shortDescription: product.shortDescription,
        longDescription: product.longDescription,
        updatedAt: product.updatedAt,
      },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* UPDATE – PRICE                                   */
  /* ================================================= */

  async updatePrice(
    product: Product,
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const client = tx ?? this.prisma;

    const row = await client.product.update({
      where: { id: product.id },
      data: {
        originalPrice: product.price.getOriginal(),
        discountPrice: product.price.getDiscount(),
        updatedAt: product.updatedAt,
      },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* UPDATE – IMAGES (UPDATE ONLY, NO AUTO TX)         */
  /* ================================================= */

async updateImages(
  product: Product,
  tx: PrismaTransaction,
): Promise<Product> {
  await tx.productImage.deleteMany({
    where: { productId: product.id },
  });

  const row = await tx.product.update({
    where: { id: product.id },
    data: {
      mainImage: product.images.getMain(),
      updatedAt: product.updatedAt,
      galleryImages: {
        create: product.images.getGallery().map(
          (imageUrl, index) => ({
            imageUrl,
            sortOrder: index,
          }),
        ),
      },
    },
    include: { galleryImages: true },
  });

  return this.toDomain(row);
}


  /* ================================================= */
  /* STATUS / TRENDING                                */
  /* ================================================= */

  async updateStatus(
    product: Product,
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const client = tx ?? this.prisma;

    const row = await client.product.update({
      where: { id: product.id },
      data: {
        status: ProductStatusMapper.toPrisma(product.status),
        updatedAt: product.updatedAt,
      },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  async updateTrending(
    product: Product,
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const client = tx ?? this.prisma;

    const row = await client.product.update({
      where: { id: product.id },
      data: {
        isTrending: product.trendState.getRaw(),
        updatedAt: product.updatedAt,
      },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* PRIVATE MAPPER                                   */
  /* ================================================= */

  private toDomain(row: {
    id: string;
    categoryId: string;
    stockItemId: string;

    productName: string;
    slug: string;

    shortDescription: string | null;
    longDescription: string | null;

    originalPrice: Prisma.Decimal;
    discountPrice: Prisma.Decimal | null;

    mainImage: string;

    unitValue: number;
    unitType: PrismaUnitType;

    ratingAverage: Prisma.Decimal | null;
    ratingCount: number;

    tags: PrismaProductTag[];

    isTrending: boolean;
    status: any;

    createdAt: Date;
    updatedAt: Date;
    createdBy: string;

    galleryImages: {
      imageUrl: string;
      sortOrder: number;
    }[];
  }): Product {
    return Product.rehydrate({
      id: row.id,
      categoryId: row.categoryId,
      stockItemId: row.stockItemId,

      name: ProductName.create(row.productName),
      slug: ProductSlug.fromString(row.slug),

      price: ProductPrice.create(
        Number(row.originalPrice),
        row.discountPrice !== null
          ? Number(row.discountPrice)
          : undefined,
      ),

      images: ProductImages.create(
        row.mainImage,
        row.galleryImages
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((img) => img.imageUrl),
      ),

      tags: ProductTagMapper.toDomain(row.tags),

      unitValue: row.unitValue,
      unitType: UnitTypeMapper.toDomain(row.unitType),

      ratingAverage:
        row.ratingAverage !== null
          ? Number(row.ratingAverage)
          : 0,

      ratingCount: row.ratingCount ?? 0,

      shortDescription: row.shortDescription ?? undefined,
      longDescription: row.longDescription ?? undefined,

      status: ProductStatusMapper.toDomain(row.status),
      trendState: ProductTrendState.from(row.isTrending),

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      createdBy: row.createdBy,
    });
  }
}
