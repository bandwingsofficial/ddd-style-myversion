import { Injectable } from '@nestjs/common';
import {
  Prisma,
  UnitType as PrismaUnitType,
  ProductTag as PrismaProductTag,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Product } from '../domain/models/product.model';
import { PublicProductQuery } from '../types/public-product-query.type';
import { PublicProductQueryDto } from '../dtos/public-product-query.dto';

import { ProductStatus } from '../domain/enums/product-status.enum';
import { ProductTag } from '../domain/enums/product-tag.enum';
import { ProductStatusMapper } from '../mappers/product-status.mapper';
import { ProductTagMapper } from '../mappers/product-tag.mapper';
import { UnitTypeMapper } from '../mappers/unit-type.mapper';

import { ProductName } from '../domain/value-objects/product-name.vo';
import { ProductSlug } from '../domain/value-objects/product-slug.vo';
import { ProductPrice } from '../domain/value-objects/product-price.vo';
import { ProductImages } from '../domain/value-objects/product-images.vo';
import { ProductTrendState } from '../domain/value-objects/product-trend-state.vo';
import { ProductFeaturedState } from '../domain/value-objects/product-featured-state.vo';
import { ProductGalleryRecord } from '../mappers/product-response.mapper';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* READ – LIST                                      */
  /* ================================================= */

  async findAll(
    context: 'admin' | 'public' = 'public',
    query?: PublicProductQueryDto,
    tx?: PrismaTransaction,
  ): Promise<
    {
      product: Product;
      category: { id: string; name: string };
    }[]
  > {
    const client = tx ?? this.prisma;

    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(context === 'public' && {
        status: ProductStatusMapper.toPrisma(ProductStatus.ACTIVE),
        isAvailable: true,
      }),

      ...(query?.categoryId && {
        categoryId: query.categoryId,
      }),

      ...(query?.search && {
        productName: {
          contains: query.search,
          mode: 'insensitive',
        },
      }),

      ...(query?.trending && {
        isTrending: true, // adjust if your field name differs
      }),
    };

    const rows = await client.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
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
  async findAllWithCategory(query: PublicProductQuery = {}): Promise<
    {
      product: Product;
      category: { id: string; name: string };
    }[]
  > {
    const { categoryId, search, trending, page = 1, limit = 20 } = query;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatusMapper.toPrisma(ProductStatus.ACTIVE),
      isAvailable: true,

      ...(categoryId && { categoryId }),

      ...(typeof trending === 'boolean' && {
        isTrending: trending,
      }),

      ...(search && {
        productName: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    };

    const rows = await this.prisma.product.findMany({
      where,

      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],

      skip: (page - 1) * limit,
      take: limit,

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

  async findBySlugWithCategory(slug: string): Promise<{
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

  async findByIdWithCategory(id: string): Promise<{
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

  async findById(id: string, tx?: PrismaTransaction): Promise<Product | null> {
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
        isAvailable: product.isAvailable,
        sortOrder: product.sortOrder,

        isTrending: product.trendState.getRaw(),
        isFeatured: product.featuredState.getRaw(),

        ingredients: product.ingredients,
        benefits: product.benefits,

        extraInfo1: product.extraInfo1,
        extraInfo2: product.extraInfo2,
        status: ProductStatusMapper.toPrisma(product.status),

        createdBy: product.createdBy,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,

        galleryImages: {
          create: product.images.getGallery().map((imageUrl, index) => ({
            imageUrl,
            sortOrder: index,
          })),
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

  async updateIngredients(
    product: Product,
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const client = tx ?? this.prisma;
    const row = await client.product.update({
      where: { id: product.id },
      data: {
        ingredients: product.ingredients,
        benefits: product.benefits,
        extraInfo1: product.extraInfo1,
        extraInfo2: product.extraInfo2,
        updatedAt: product.updatedAt,
      },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* GALLERY RECORDS                                   */
  /* ================================================= */

  async findGalleryRecords(
    productId: string,
    tx?: PrismaTransaction,
  ): Promise<ProductGalleryRecord[]> {
    const client = tx ?? this.prisma;

    const rows = await client.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        imageUrl: true,
        sortOrder: true,
      },
    });

    return rows;
  }

  async findGalleryRecordsByProductIds(
    productIds: string[],
    tx?: PrismaTransaction,
  ): Promise<Map<string, ProductGalleryRecord[]>> {
    const client = tx ?? this.prisma;
    const map = new Map<string, ProductGalleryRecord[]>();

    if (!productIds.length) {
      return map;
    }

    const rows = await client.productImage.findMany({
      where: { productId: { in: productIds } },
      orderBy: [{ productId: 'asc' }, { sortOrder: 'asc' }],
      select: {
        id: true,
        productId: true,
        imageUrl: true,
        sortOrder: true,
      },
    });

    for (const row of rows) {
      const existing = map.get(row.productId) ?? [];
      existing.push({
        id: row.id,
        imageUrl: row.imageUrl,
        sortOrder: row.sortOrder,
      });
      map.set(row.productId, existing);
    }

    return map;
  }

  async findGalleryRecordById(
    productId: string,
    galleryImageId: string,
    tx?: PrismaTransaction,
  ): Promise<ProductGalleryRecord | null> {
    const client = tx ?? this.prisma;

    const row = await client.productImage.findFirst({
      where: {
        id: galleryImageId,
        productId,
      },
      select: {
        id: true,
        imageUrl: true,
        sortOrder: true,
      },
    });

    return row;
  }

  /* ================================================= */
  /* UPDATE – IMAGES (SURGICAL)                        */
  /* ================================================= */

  async updateMainImage(
    productId: string,
    mainImage: string,
    tx: PrismaTransaction,
  ): Promise<Product> {
    const row = await tx.product.update({
      where: { id: productId },
      data: {
        mainImage,
        updatedAt: new Date(),
      },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  async replaceGalleryImageById(
    productId: string,
    galleryImageId: string,
    objectKey: string,
    tx: PrismaTransaction,
  ): Promise<Product> {
    await tx.productImage.update({
      where: { id: galleryImageId },
      data: { imageUrl: objectKey },
    });

    const row = await tx.product.update({
      where: { id: productId },
      data: { updatedAt: new Date() },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  async deleteGalleryImageById(
    productId: string,
    galleryImageId: string,
    tx: PrismaTransaction,
  ): Promise<Product> {
    await tx.productImage.delete({
      where: { id: galleryImageId },
    });

    const row = await tx.product.update({
      where: { id: productId },
      data: { updatedAt: new Date() },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  async addGalleryImage(
    productId: string,
    objectKey: string,
    sortOrder: number,
    tx: PrismaTransaction,
  ): Promise<Product> {
    await tx.productImage.create({
      data: {
        productId,
        imageUrl: objectKey,
        sortOrder,
      },
    });

    const row = await tx.product.update({
      where: { id: productId },
      data: { updatedAt: new Date() },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  async reorderGalleryImages(
    productId: string,
    orderedGalleryImageIds: string[],
    tx: PrismaTransaction,
  ): Promise<Product> {
    await Promise.all(
      orderedGalleryImageIds.map((galleryImageId, index) =>
        tx.productImage.update({
          where: { id: galleryImageId },
          data: { sortOrder: index },
        }),
      ),
    );

    const row = await tx.product.update({
      where: { id: productId },
      data: { updatedAt: new Date() },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

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
          create: product.images.getGallery().map((imageUrl, index) => ({
            imageUrl,
            sortOrder: index,
          })),
        },
      },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  async hardDelete(productId: string, tx?: PrismaTransaction): Promise<void> {
    const client = tx ?? this.prisma;

    await client.product.delete({
      where: { id: productId },
    });
  }

  async archiveProduct(
    product: Product,
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const client = tx ?? this.prisma;
    const archived = product.archive();

    const row = await client.product.update({
      where: { id: archived.id },
      data: {
        status: ProductStatusMapper.toPrisma(archived.status),
        isAvailable: archived.isAvailable,
        isTrending: archived.trendState.getRaw(),
        isFeatured: archived.featuredState.getRaw(),
        deletedAt: null,
        updatedAt: archived.updatedAt,
      },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  async restoreProduct(
    product: Product,
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const client = tx ?? this.prisma;
    const restored = product.restore();

    const row = await client.product.update({
      where: { id: restored.id },
      data: {
        status: ProductStatusMapper.toPrisma(restored.status),
        isAvailable: restored.isAvailable,
        deletedAt: null,
        updatedAt: restored.updatedAt,
      },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  async findRelatedActiveProducts(params: {
    categoryId: string;
    excludeProductId: string;
    limit?: number;
  }): Promise<
    {
      product: Product;
      category: { id: string; name: string };
    }[]
  > {
    const rows = await this.prisma.product.findMany({
      where: {
        categoryId: params.categoryId,
        id: { not: params.excludeProductId },
        status: ProductStatusMapper.toPrisma(ProductStatus.ACTIVE),
        isAvailable: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: params.limit ?? 8,
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

  async updateFeatured(
    product: Product,
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const client = tx ?? this.prisma;

    const row = await client.product.update({
      where: { id: product.id },
      data: {
        isFeatured: product.featuredState.getRaw(),
        updatedAt: product.updatedAt,
      },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  async updateAvailability(
    product: Product,
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const client = tx ?? this.prisma;

    const row = await client.product.update({
      where: { id: product.id },
      data: {
        isAvailable: product.isAvailable,
        updatedAt: product.updatedAt,
      },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  async updateSortOrder(
    product: Product,
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const client = tx ?? this.prisma;

    const row = await client.product.update({
      where: { id: product.id },
      data: {
        sortOrder: product.sortOrder,
        updatedAt: product.updatedAt,
      },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  async searchPublicPaginated(params: {
    q: string;
    page: number;
    limit: number;
    categoryId?: string;
    outletId?: string;
    sort?: 'price_low' | 'price_high' | 'newest' | 'popularity';
  }): Promise<{
    items: {
      product: Product;
      category: { id: string; name: string };
    }[];
    total: number;
  }> {
    const where = this.buildPublicSearchWhere(params);
    const orderBy = this.buildPublicSearchOrderBy(params.sort);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: {
          galleryImages: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        product: this.toDomain(row),
        category: row.category,
      })),
      total,
    };
  }

  async findPaginatedAdmin(params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    status?: ProductStatus;
  }): Promise<{
    items: {
      product: Product;
      category: { id: string; name: string };
    }[];
    total: number;
  }> {
    const where = this.buildAdminSearchWhere(params);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: {
          galleryImages: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { status: 'asc' },
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        product: this.toDomain(row),
        category: row.category,
      })),
      total,
    };
  }

  async findByProductName(
    name: string,
    excludeId?: string,
  ): Promise<Product | null> {
    const row = await this.prisma.product.findFirst({
      where: {
        productName: {
          equals: name.trim(),
          mode: 'insensitive',
        },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      include: { galleryImages: true },
    });

    return row ? this.toDomain(row) : null;
  }

  async countCartItemsByProductId(productId: string): Promise<number> {
    return this.prisma.cartItem.count({ where: { productId } });
  }

  async countOrderItemsByProductId(productId: string): Promise<number> {
    return this.prisma.orderItem.count({ where: { productId } });
  }

  async countOutletProductsByProductId(productId: string): Promise<number> {
    return this.prisma.outletProduct.count({ where: { productId } });
  }

  async deleteCartItemsByProductId(
    productId: string,
    tx?: PrismaTransaction,
  ): Promise<number> {
    const client = tx ?? this.prisma;
    const result = await client.cartItem.deleteMany({ where: { productId } });
    return result.count;
  }

  async deleteOutletProductsByProductId(
    productId: string,
    tx?: PrismaTransaction,
  ): Promise<number> {
    const client = tx ?? this.prisma;
    const result = await client.outletProduct.deleteMany({
      where: { productId },
    });
    return result.count;
  }

  private buildPublicSearchWhere(params: {
    q: string;
    categoryId?: string;
    outletId?: string;
  }): Prisma.ProductWhereInput {
    const trimmed = params.q.trim();
    const normalizedSearch = trimmed.toLowerCase();

    const matchingTags = trimmed
      ? (Object.values(ProductTag) as ProductTag[]).filter(
          (tag) =>
            tag.toLowerCase().includes(normalizedSearch) ||
            tag.replace(/_/g, ' ').toLowerCase().includes(normalizedSearch),
        )
      : [];

    return {
      status: ProductStatusMapper.toPrisma(ProductStatus.ACTIVE),
      isAvailable: true,
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.outletId && {
        outlets: {
          some: {
            outletId: params.outletId,
            isAvailable: true,
          },
        },
      }),
      ...(trimmed && {
        OR: [
          {
            productName: {
              contains: trimmed,
              mode: 'insensitive',
            },
          },
          {
            slug: {
              contains: trimmed,
              mode: 'insensitive',
            },
          },
          {
            shortDescription: {
              contains: trimmed,
              mode: 'insensitive',
            },
          },
          {
            longDescription: {
              contains: trimmed,
              mode: 'insensitive',
            },
          },
          {
            ingredients: {
              contains: trimmed,
              mode: 'insensitive',
            },
          },
          {
            benefits: {
              contains: trimmed,
              mode: 'insensitive',
            },
          },
          {
            extraInfo1: {
              contains: trimmed,
              mode: 'insensitive',
            },
          },
          {
            extraInfo2: {
              contains: trimmed,
              mode: 'insensitive',
            },
          },
          {
            category: {
              name: {
                contains: trimmed,
                mode: 'insensitive',
              },
            },
          },
          ...(matchingTags.length > 0
            ? [
                {
                  tags: {
                    hasSome: ProductTagMapper.toPrisma(matchingTags),
                  },
                },
              ]
            : []),
        ],
      }),
    };
  }

  private buildPublicSearchOrderBy(
    sort?: 'price_low' | 'price_high' | 'newest' | 'popularity',
  ): Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
      case 'price_low':
        return [{ originalPrice: 'asc' }, { sortOrder: 'asc' }];
      case 'price_high':
        return [{ originalPrice: 'desc' }, { sortOrder: 'asc' }];
      case 'newest':
        return [{ createdAt: 'desc' }, { sortOrder: 'asc' }];
      case 'popularity':
        return [
          { ratingCount: 'desc' },
          { ratingAverage: 'desc' },
          { sortOrder: 'asc' },
        ];
      default:
        return [{ sortOrder: 'asc' }, { createdAt: 'desc' }];
    }
  }

  private buildAdminSearchWhere(params: {
    search?: string;
    categoryId?: string;
    status?: ProductStatus;
  }): Prisma.ProductWhereInput {
    const trimmed = params.search?.trim();
    const normalizedSearch = trimmed?.toLowerCase() ?? '';

    const matchingTags = trimmed
      ? (Object.values(ProductTag) as ProductTag[]).filter(
          (tag) =>
            tag.toLowerCase().includes(normalizedSearch) ||
            tag.replace(/_/g, ' ').toLowerCase().includes(normalizedSearch),
        )
      : [];

    return {
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.status && {
        status: ProductStatusMapper.toPrisma(params.status),
      }),
      ...(trimmed && {
        OR: [
          {
            productName: {
              contains: trimmed,
              mode: 'insensitive',
            },
          },
          {
            slug: {
              contains: trimmed,
              mode: 'insensitive',
            },
          },
          {
            category: {
              name: {
                contains: trimmed,
                mode: 'insensitive',
              },
            },
          },
          ...(matchingTags.length > 0
            ? [
                {
                  tags: {
                    hasSome: ProductTagMapper.toPrisma(matchingTags),
                  },
                },
              ]
            : []),
        ],
      }),
    };
  }

  /* ================================================= */
  /* PRIVATE MAPPER                                   */
  /* ================================================= */

  private toDomain(row: {
    id: string;
    categoryId: string;

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
    isAvailable: boolean;
    sortOrder: number;

    isTrending: boolean;
    isFeatured: boolean;

    ingredients: string | null;
    benefits: string | null;

    extraInfo1: string | null;
    extraInfo2: string | null;
    status: any;
    deletedAt?: Date | null;

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

      name: ProductName.create(row.productName),
      slug: ProductSlug.fromString(row.slug),

      price: ProductPrice.create(
        Number(row.originalPrice),
        row.discountPrice !== null ? Number(row.discountPrice) : undefined,
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

      ratingAverage: row.ratingAverage !== null ? Number(row.ratingAverage) : 0,

      ratingCount: row.ratingCount ?? 0,

      isAvailable: row.isAvailable,
      sortOrder: row.sortOrder,

      shortDescription: row.shortDescription ?? undefined,
      longDescription: row.longDescription ?? undefined,

      status: ProductStatusMapper.toDomain(row.status),
      trendState: ProductTrendState.from(row.isTrending),
      featuredState: ProductFeaturedState.from(row.isFeatured), // adjust if your field exists

      ingredients: row.ingredients ?? undefined,
      benefits: row.benefits ?? undefined,
      extraInfo1: row.extraInfo1 ?? undefined,
      extraInfo2: row.extraInfo2 ?? undefined,

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      createdBy: row.createdBy,
      deletedAt: row.deletedAt ?? null,
    });
  }
}
