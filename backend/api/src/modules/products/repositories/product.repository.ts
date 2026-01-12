import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Product } from '../domain/models/product.model';

import { ProductStatusMapper } from '../mappers/product-status.mapper';

import { ProductName } from '../domain/value-objects/product-name.vo';
import { ProductSlug } from '../domain/value-objects/product-slug.vo';
import { ProductPrice } from '../domain/value-objects/product-price.vo';
import { ProductImages } from '../domain/value-objects/product-images.vo';
import { ProductTrendState } from '../domain/value-objects/product-trend-state.vo';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
/* READ – ALL PRODUCTS                               */
/* ================================================= */

async findAll(
  tx?: PrismaTransaction,
): Promise<Product[]> {
  const rows = await (tx ?? this.prisma).product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      galleryImages: true,
    },
  });

  return rows.map(row => this.toDomain(row));
}
  /* ================================================= */
/* READ – PUBLIC CATALOG                             */
/* ================================================= */

async findPublicProducts(): Promise<Product[]> {
  const rows = await this.prisma.product.findMany({
    where: {
      status: 'ACTIVE',
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      galleryImages: true,
    },
  });

  return rows.map(row => this.toDomain(row));
}

  
  
  /* ================================================= */
  /* CREATE                                            */
  /* ================================================= */

  async create(
    product: Product,
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const client = tx ?? this.prisma;

    const row = await client.product.create({
      data: {
        id: product.id,
        stockItemId: product.stockItemId,

        productName: product.name.getValue(),
        slug: product.slug.getValue(),

        shortDescription: product.shortDescription,
        longDescription: product.longDescription,

        originalPrice: product.price.getOriginal(),
        discountPrice: product.price.getDiscount(),

        mainImage: product.images.getMain(),

        isTrending: product.trendState.getRaw(),
        status: ProductStatusMapper.toPrisma(product.status),

        createdBy: product.createdBy, // ✅ FIX
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
      },
      include: { galleryImages: true },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* READS                                             */
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

  async existsById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<boolean> {
    const product = await (tx ?? this.prisma).product.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!product;
  }

  /* ================================================= */
  /* UPDATE DETAILS                                    */
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
  /* UPDATE PRICE                                      */
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
  /* UPDATE IMAGES                                     */
  /* ================================================= */

  async updateImages(
    product: Product,
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const client = tx ?? this.prisma;

    await client.productImage.deleteMany({
      where: { productId: product.id },
    });

    const row = await client.product.update({
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
  /* STATUS / TRENDING                                 */
  /* ================================================= */

  async updateStatus(
    product: Product,
    tx?: PrismaTransaction,
  ): Promise<Product> {
    const row = await (tx ?? this.prisma).product.update({
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
    const row = await (tx ?? this.prisma).product.update({
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
    stockItemId: string;

    productName: string;
    slug: string;

    shortDescription: string | null;
    longDescription: string | null;

    originalPrice: any;
    discountPrice: any;

    mainImage: string;

    isTrending: boolean;
    status: any;

    createdAt: Date;
    updatedAt: Date;
    createdBy: string; // ✅ REQUIRED

    galleryImages: {
      imageUrl: string;
      sortOrder: number;
    }[];
  }): Product {
    return Product.rehydrate({
      id: row.id,
      stockItemId: row.stockItemId,

      name: ProductName.create(row.productName),
      slug: ProductSlug.fromProductName(row.productName),

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
