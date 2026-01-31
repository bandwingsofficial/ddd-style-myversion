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
import { PublicProductQueryDto } from '../dtos/public-product-query.dto';

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

async getAllProducts(query?: PublicProductQueryDto): Promise<Product[]> {
  const rows = await this.productRepo.findAll('admin', query);

  return rows.map(r => r.product);
}

async getPublicProducts(query: PublicProductQueryDto) {
  return this.productRepo.findAll('public', query);
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
    const result = await this.productRepo.findBySlugWithCategory(slug);

    if (!result) {
      throw new ValidationError('PRODUCT_NOT_FOUND', 'Product not found');
    }

    return result;
  }

  async getByIdWithCategory(productId: string): Promise<{
    product: Product;
    category: { id: string; name: string };
  }> {
    const result = await this.productRepo.findByIdWithCategory(productId);

    if (!result) {
      throw new ValidationError('PRODUCT_NOT_FOUND', 'Product not found');
    }

    return result;
  }

  async getById(productId: string): Promise<Product> {
    const product = await this.productRepo.findById(productId);

    if (!product) {
      throw new ValidationError('PRODUCT_NOT_FOUND', 'Product not found');
    }

    return product;
  }

  async getBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findBySlug(slug);

    if (!product) {
      throw new ValidationError('PRODUCT_NOT_FOUND', 'Product not found');
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

  // ✅ Normalize images
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

  try {
    await this.prisma.$transaction(async (tx) => {
      created = await this.productRepo.create(
        { product: normalizedProduct },
        tx,
      );
    });
  } catch (e: any) {
    /* 🔥 HANDLE UNIQUE CONSTRAINT CLEANLY */
    if (e.code === 'P2002') {
      const field = e.meta?.target?.[0];

      if (field === 'productName') {
        throw new ValidationError(
          'PRODUCT_NAME_EXISTS',
          'Product with same name already exists',
        );
      }

      if (field === 'slug') {
        throw new ValidationError(
          'PRODUCT_SLUG_EXISTS',
          'Product slug already exists',
        );
      }
    }

    throw e;
  }

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
  /* UPDATE INGREDIENTS                               */
  /* ================================================= */

  async updateIngredients(params: {
    productId: string;
    ingredients?: string;
    benefits?: string;
    extraInfo1?: string;
    extraInfo2?: string;
  }): Promise<Product> {
    const product = await this.getById(params.productId);

    if (!product.isActive()) {
      throw new ValidationError(
        'PRODUCT_INACTIVE',
        'Inactive product cannot be updated',
      );
    }

    const updated = product.updateIngredients({
      ingredients: params.ingredients,
      benefits: params.benefits,
      extraInfo1: params.extraInfo1,
      extraInfo2: params.extraInfo2,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateIngredients(updated, tx);
    });

    this.productEvents.emitProductContentUpdated({
  productId: updated.id,
  ingredients: updated.ingredients ?? null,
  benefits: updated.benefits ?? null,
  extraInfo1: updated.extraInfo1 ?? null,
  extraInfo2: updated.extraInfo2 ?? null,
});

    return updated;
  }

  /* ================================================= */
    /* UPDATE IMAGES                                    */
  /* ================================================= */

  async updateImages(params: {
    productId: string;
    mainImage?: string;
    galleryImages?: string[];
    replaceImage?: string; // 🔥 NEW
  }): Promise<Product> {
    const product = await this.getById(params.productId);

    /* ---------------------------------- */
    /* Product must be active             */
    /* ---------------------------------- */
    if (!product.isActive()) {
      throw new ValidationError(
        'PRODUCT_INACTIVE',
        'Inactive product cannot be updated',
      );
    }

    /* ---------------------------------- */
    /* Prevent empty update               */
    /* ---------------------------------- */
    if (
      params.mainImage === undefined &&
      params.galleryImages === undefined &&
      params.replaceImage === undefined
    ) {
      throw new ValidationError(
        'NO_IMAGES_PROVIDED',
        'No images provided to update',
      );
    }

    /* ---------------------------------- */
    /* Resolve next main image             */
    /* ---------------------------------- */
    const nextMainImage = params.mainImage
      ? this.normalizeImagePath(params.mainImage)
      : product.images.getMain();

    if (!nextMainImage) {
      throw new ValidationError(
        'INVALID_MAIN_IMAGE',
        'Main image must be a non-empty string',
      );
    }

    /* ---------------------------------- */
    /* Handle gallery replacement 🔥      */
    /* ---------------------------------- */
    let nextGalleryImages = product.images.getGallery();

    if (params.replaceImage && params.galleryImages?.length === 1) {
      const target = this.normalizeImagePath(params.replaceImage);
      const replacement = this.normalizeImagePath(params.galleryImages[0]);

      const index = nextGalleryImages.indexOf(target!);

      if (index === -1) {
        throw new ValidationError(
          'GALLERY_IMAGE_NOT_FOUND',
          'Image to replace was not found in gallery',
        );
      }

      nextGalleryImages = [...nextGalleryImages];
      nextGalleryImages[index] = replacement!;

      // delete ONLY replaced image
      this.deleteImageSafe(target!);
    } else if (params.galleryImages !== undefined) {

    /* ---------------------------------- */
    /* Full gallery replace (optional)    */
    /* ---------------------------------- */
      nextGalleryImages = params.galleryImages
        .map((img) => this.normalizeImagePath(img))
        .filter((img): img is string => Boolean(img));
    }

    /* ---------------------------------- */
    /* Track old images                   */
    /* ---------------------------------- */
    const oldImages = new Set([
      product.images.getMain(),
      ...product.images.getGallery(),
    ]);

    /* ---------------------------------- */
    /* Update domain                      */
    /* ---------------------------------- */
    const updated = product.updateImages({
      mainImage: nextMainImage,
      galleryImages: nextGalleryImages,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateImages(updated, tx);
    });

    /* ---------------------------------- */
    /* Delete removed files only          */
    /* ---------------------------------- */
    const newImages = new Set([
      updated.images.getMain(),
      ...updated.images.getGallery(),
    ]);

    oldImages.forEach((img) => {
      if (!newImages.has(img)) {
        this.deleteImageSafe(img);
      }
    });

    /* ---------------------------------- */
    /* Emit event                         */
    /* ---------------------------------- */
    this.productEvents.emitProductImagesChanged({
      productId: updated.id,
      mainImage: updated.images.getMain(),
      galleryImages: updated.images.getGallery(),
    });

    return updated;
  }

  /* ================================================= */
  /* DELETE SINGLE GALLERY IMAGE                       */
  /* ================================================= */

  async deleteProductImage(params: {
    productId: string;
    imagePath: string;
  }): Promise<Product> {
    const product = await this.getById(params.productId);

    /* ---------------------------------- */
    /* Product must be active             */
    /* ---------------------------------- */
    if (!product.isActive()) {
      throw new ValidationError(
        'PRODUCT_INACTIVE',
        'Inactive product cannot be updated',
      );
    }

    /* ---------------------------------- */
    /* Normalize & validate image path    */
    /* ---------------------------------- */
    const normalizedPath = this.normalizeImagePath(params.imagePath);

    if (!normalizedPath) {
      throw new ValidationError('INVALID_IMAGE_PATH', 'Invalid image path');
    }

    /* ---------------------------------- */
    /* Block main image deletion          */
    /* ---------------------------------- */
    if (product.images.getMain() === normalizedPath) {
      throw new ValidationError(
        'MAIN_IMAGE_DELETE_FORBIDDEN',
        'Main image cannot be deleted directly',
      );
    }

    /* ---------------------------------- */
    /* Ensure image exists in gallery     */
    /* ---------------------------------- */
    const galleryImages = product.images.getGallery();

    if (!galleryImages.includes(normalizedPath)) {
      throw new ValidationError(
        'GALLERY_IMAGE_NOT_FOUND',
        'Image not found in gallery',
      );
    }

    /* ---------------------------------- */
    /* Track old images                   */
    /* ---------------------------------- */
    const oldImages = new Set([product.images.getMain(), ...galleryImages]);

    /* ---------------------------------- */
    /* Update domain (remove image)       */
    /* ---------------------------------- */
    const updated = product.updateImages({
      mainImage: product.images.getMain(),
      galleryImages: galleryImages.filter((img) => img !== normalizedPath),
    });

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateImages(updated, tx);
    });

    /* ---------------------------------- */
    /* Delete removed file                */
    /* ---------------------------------- */
    const newImages = new Set([
      updated.images.getMain(),
      ...updated.images.getGallery(),
    ]);

    oldImages.forEach((img) => {
      if (!newImages.has(img)) {
        this.deleteImageSafe(img);
      }
    });

    /* ---------------------------------- */
    /* Emit event                         */
    /* ---------------------------------- */
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

  async markFeatured(productId: string): Promise<void> {
    const product = await this.getById(productId);

    if (!product.isActive()) {
      throw new ValidationError(
        'PRODUCT_INACTIVE',
        'Inactive product cannot be marked featured',
      );
    }

    const updated = product.markFeatured();

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateFeatured(updated, tx);
    });

    this.productEvents.emitProductFeaturedChanged({
      productId: updated.id,
      isFeatured: true,
    });
  } async unmarkFeatured(productId: string): Promise<void> {
    const product = await this.getById(productId);

    const updated = product.unmarkFeatured();

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateFeatured(updated, tx);
    });

    this.productEvents.emitProductFeaturedChanged({
      productId: updated.id,
      isFeatured: false,
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

      isAvailable: product.isAvailable,
      sortOrder: product.sortOrder,

      shortDescription: product.shortDescription,
      longDescription: product.longDescription,

      status: ProductStatus.ACTIVE,
      trendState: product.trendState,
      featuredState: product.featuredState,

      ingredients: product.ingredients,
      benefits: product.benefits,

      extraInfo1: product.extraInfo1,
      extraInfo2: product.extraInfo2,

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
      process.env.APP_ROOT ?? path.resolve(process.cwd(), '..', '..');

    const fullPath = path.join(appRoot, imagePath);

    fs.promises.unlink(fullPath).catch(() => {
      // silent fail (file may not exist)
    });
  }
}
