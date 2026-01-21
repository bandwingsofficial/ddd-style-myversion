import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { Product } from '../domain/models/product.model';
import { ProductRepository } from '../repositories/product.repository';

import { ValidationError } from '../../../common/errors';
import { ProductStatus } from '../domain/enums/product-status.enum';

/* 🔥 EVENTS */
import { ProductEventsService } from '../events/product-events.service';
import { ProductImages } from '../domain/value-objects/product-images.vo';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productRepo: ProductRepository,
    private readonly productEvents: ProductEventsService,
  ) {}

  /* ================================================= */
  /* 🔒 IMAGE PATH NORMALIZATION                       */
  /* ================================================= */

  private normalizeImagePath(
    imagePath?: string | null,
  ): string | null | undefined {
    if (!imagePath) return imagePath;

    let normalized = imagePath.trim();

    normalized = normalized.replace(/^https?:\/\/[^/]+\//, '');

    if (normalized.startsWith('/')) {
      normalized = normalized.slice(1);
    }

    if (!normalized.startsWith('images/products/')) {
      throw new ValidationError(
        'PRODUCT_INVALID_IMAGE_PATH',
        'Image path must be under images/products/',
      );
    }

    return normalized;
  }

  /* ================================================= */
  /* READS                                            */
  /* ================================================= */

  async getAllProducts(): Promise<Product[]> {
    return this.productRepo.findAll();
  }

  async getPublicProducts(): Promise<Product[]> {
    const products = await this.productRepo.findAll();
    return products.filter((p) => p.canBeShown());
    
  }

  async getPublicProductsWithCategory(): Promise<
  {
    product: Product;
    category: { id: string; name: string };
  }[]
> {
  return this.productRepo.findAllWithCategory();
}

async getBySlugWithCategory(slug: string): Promise<{
  product: Product;
  category: { id: string; name: string };
}> {
  const result =
    await this.productRepo.findBySlugWithCategory(slug);

  if (!result) {
    throw new ValidationError(
      'PRODUCT_NOT_FOUND',
      'Product not found',
    );
  }

  return result;
}


async getByIdWithCategory(productId: string): Promise<{
  product: Product;
  category: { id: string; name: string };
}> {
  const result =
    await this.productRepo.findByIdWithCategory(productId);

  if (!result) {
    throw new ValidationError(
      'PRODUCT_NOT_FOUND',
      'Product not found',
    );
  }

  return result;
}


  async getById(productId: string): Promise<Product> {
    const product = await this.productRepo.findById(productId);

    if (!product) {
      throw new ValidationError(
        'PRODUCT_NOT_FOUND',
        'Product not found',
      );
    }

    return product;


  }

  async getBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findBySlug(slug);

    if (!product) {
      throw new ValidationError(
        'PRODUCT_NOT_FOUND',
        'Product not found',
      );
    }

    return product;
  }

  /* ================================================= */
  /* CREATE PRODUCT (✅ FIXED)                          */
  /* ================================================= */

  async createProduct(product: Product): Promise<Product> {
  // ✅ Category must exist
  const categoryExists = await this.prisma.category.findUnique({
    where: { id: product.categoryId },
    select: { id: true },
  });

  if (!categoryExists) {
    throw new ValidationError(
      'CATEGORY_NOT_FOUND',
      'Category does not exist',
    );
  }

  // ✅ Stock item must exist
  const stockExists = await this.prisma.stockItem.findUnique({
    where: { id: product.stockItemId },
    select: { id: true },
  });

  if (!stockExists) {
    throw new ValidationError(
      'STOCK_ITEM_NOT_FOUND',
      'Stock item does not exist',
    );
  }

  // ✅ NORMALIZE IMAGE PATHS (NO updateImages CALL)
  const normalizedProduct = Product.rehydrate({
    ...product,
    images: ProductImages.create(
      this.normalizeImagePath(product.images.getMain())!,
      product.images
        .getGallery()
        .map((img) => this.normalizeImagePath(img)!),
    ),
  });

  let created!: Product;

  await this.prisma.$transaction(async (tx) => {
    created = await this.productRepo.create(
      { product: normalizedProduct },
      tx,
    );
  });

  this.productEvents.emitProductCreated({
    productId: created.id,
  });

  return created;
}

  /* ================================================= */
  /* UPDATE DETAILS                                   */
  /* ================================================= */

  async updateDetails(params: {
    productId: string;
    updates: {
      productName?: string;
      shortDescription?: string;
      longDescription?: string;
    };
  }): Promise<Product> {
    const product = await this.getById(params.productId);

    if (!product.isActive()) {
      throw new ValidationError(
        'PRODUCT_INACTIVE',
        'Inactive product cannot be updated',
      );
    }

    const updated = product.updateDetails(params.updates);

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateDetails(updated, tx);
    });

    this.productEvents.emitProductUpdated({
      productId: updated.id,
      name: updated.name.getValue(),
      slug: updated.slug.getValue(),
    });

    return updated;
  }

  /* ================================================= */
  /* UPDATE PRICE                                     */
  /* ================================================= */

  async updatePrice(params: {
    productId: string;
    originalPrice: number;
    discountPrice?: number;
  }): Promise<Product> {
    const product = await this.getById(params.productId);

    if (!product.isActive()) {
      throw new ValidationError(
        'PRODUCT_INACTIVE',
        'Inactive product cannot be updated',
      );
    }

    const updated = product.updatePrice(params);

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updatePrice(updated, tx);
    });

    this.productEvents.emitProductPriceChanged({
      productId: updated.id,
      originalPrice: params.originalPrice,
      discountPrice: params.discountPrice ?? null,
    });

    return updated;
  }

  /* ================================================= */
  /* UPDATE IMAGES                                    */
  /* ================================================= */

  async updateImages(params: {
    productId: string;
    mainImage: string;
    galleryImages?: string[];
  }): Promise<Product> {
    const product = await this.getById(params.productId);

    if (!product.isActive()) {
      throw new ValidationError(
        'PRODUCT_INACTIVE',
        'Inactive product cannot be updated',
      );
    }

    const oldImages = [
      product.images.getMain(),
      ...product.images.getGallery(),
    ];

    const updated = product.updateImages({
      mainImage: this.normalizeImagePath(params.mainImage)!,
      galleryImages: params.galleryImages
        ?.map((img) => this.normalizeImagePath(img)!)
        .filter(Boolean),
    });

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateImages(updated, tx);
    });

    oldImages.forEach((img) => this.deleteImageSafe(img));

    this.productEvents.emitProductImagesChanged({
      productId: updated.id,
      mainImage: updated.images.getMain(),
      galleryImages: updated.images.getGallery(),
    });

    return updated;
  }

  /* ================================================= */
  /* TRENDING                                         */
  /* ================================================= */

  async markTrending(productId: string): Promise<void> {
    const product = await this.getById(productId);

    if (!product.isActive()) {
      throw new ValidationError(
        'PRODUCT_INACTIVE',
        'Inactive product cannot be marked trending',
      );
    }

    const updated = product.markTrending();

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateTrending(updated, tx);
    });

    this.productEvents.emitProductTrendingChanged({
      productId: updated.id,
      isTrending: true,
    });
  }

  async unmarkTrending(productId: string): Promise<void> {
    const product = await this.getById(productId);

    const updated = product.unmarkTrending();

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateTrending(updated, tx);
    });

    this.productEvents.emitProductTrendingChanged({
      productId: updated.id,
      isTrending: false,
    });
  }

  /* ================================================= */
  /* ENABLE / DISABLE                                 */
  /* ================================================= */

  async disableProduct(
    productId: string,
  ): Promise<{ id: string; status: 'INACTIVE' }> {
    const product = await this.getById(productId);

    if (!product.isActive()) {
      return { id: product.id, status: 'INACTIVE' };
    }

    const disabled = product.disable();

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateStatus(disabled, tx);
    });

    this.productEvents.emitProductDisabled({
      productId: product.id,
    });

    return { id: product.id, status: 'INACTIVE' };
  }

  async enableProduct(
    productId: string,
  ): Promise<{ id: string; status: 'ACTIVE' }> {
    const product = await this.getById(productId);

    if (product.isActive()) {
      return { id: product.id, status: 'ACTIVE' };
    }

    // ✅ FIX: FULL REHYDRATE
    const enabled = Product.rehydrate({
      id: product.id,
      categoryId: product.categoryId,
      stockItemId: product.stockItemId,

      name: product.name,
      slug: product.slug,
      price: product.price,
      images: product.images,

      tags: product.tags,
      unitValue: product.unitValue,
      unitType: product.unitType,

      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,

      shortDescription: product.shortDescription,
      longDescription: product.longDescription,

      status: ProductStatus.ACTIVE,
      trendState: product.trendState,

      createdAt: product.createdAt,
      updatedAt: new Date(),
      createdBy: product.createdBy,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateStatus(enabled, tx);
    });

    this.productEvents.emitProductEnabled({
      productId: product.id,
    });

    return { id: product.id, status: 'ACTIVE' };
  }

  /* ================================================= */
  /* FILE HELPERS                                     */
  /* ================================================= */

  private deleteImageSafe(imagePath?: string): void {
  if (!imagePath) return;

  const appRoot =
    process.env.APP_ROOT ??
    path.resolve(process.cwd(), '..', '..');

  const fullPath = path.join(appRoot, imagePath);

  fs.promises.unlink(fullPath).catch(() => {
    // silent fail (file may not exist)
  });
}
}