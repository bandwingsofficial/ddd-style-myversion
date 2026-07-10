import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { Product } from '../domain/models/product.model';
import { ProductRepository } from '../repositories/product.repository';

import { ValidationError } from '../../../common/errors';
import { ProductStatus } from '../domain/enums/product-status.enum';

/* 🔥 EVENTS */
import { ProductEventsService } from '../events/product-events.service';
import { ProductImages } from '../domain/value-objects/product-images.vo';
import { PublicProductQueryDto } from '../dtos/public-product-query.dto';
import { UploadFolders } from '../../uploads/constants/upload-folders.constants';
import { UploadService } from '../../uploads/services/upload.service';
import { MulterUploadFile } from '../../uploads/interfaces/upload-file.interface';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productRepo: ProductRepository,
    private readonly productEvents: ProductEventsService,
    private readonly uploadService: UploadService,
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

    if (!normalized.startsWith(`${UploadFolders.PRODUCTS}/`)) {
      throw new ValidationError(
        'PRODUCT_INVALID_IMAGE_PATH',
        `Image path must be under ${UploadFolders.PRODUCTS}/`,
      );
    }

    return normalized;
  }

  /* ================================================= */
  /* READS                                            */
  /* ================================================= */

  async getAllProducts(query?: PublicProductQueryDto): Promise<Product[]> {
    const rows = await this.productRepo.findAll('admin', query);

    return rows.map((r) => r.product);
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
  /* CREATE PRODUCT                                    */
  /* ================================================= */

  async createProduct(params: {
    product: Product;
    mainImageFile: MulterUploadFile;
    galleryImageFiles?: MulterUploadFile[];
  }): Promise<Product> {
    const categoryExists = await this.prisma.category.findUnique({
      where: { id: params.product.categoryId },
      select: { id: true },
    });

    if (!categoryExists) {
      throw new ValidationError(
        'CATEGORY_NOT_FOUND',
        'Category does not exist',
      );
    }

    const stockExists = await this.prisma.stockItem.findUnique({
      where: { id: params.product.stockItemId },
      select: { id: true },
    });

    if (!stockExists) {
      throw new ValidationError(
        'STOCK_ITEM_NOT_FOUND',
        'Stock item does not exist',
      );
    }

    const mainUpload = await this.uploadService.uploadSingleImage({
      folder: UploadFolders.PRODUCTS,
      file: params.mainImageFile,
    });

    const galleryUploads = params.galleryImageFiles?.length
      ? await this.uploadService.uploadMultipleImages({
          folder: UploadFolders.PRODUCTS,
          files: params.galleryImageFiles,
        })
      : [];

    const normalizedProduct = Product.rehydrate({
      id: params.product.id,
      categoryId: params.product.categoryId,
      stockItemId: params.product.stockItemId,
      name: params.product.name,
      slug: params.product.slug,
      price: params.product.price,
      images: ProductImages.create(
        mainUpload.objectKey,
        galleryUploads.map((upload) => upload.objectKey),
      ),
      tags: params.product.tags,
      sortOrder: params.product.sortOrder,
      isAvailable: params.product.isAvailable,
      unitValue: params.product.unitValue,
      unitType: params.product.unitType,
      ratingAverage: params.product.ratingAverage,
      ratingCount: params.product.ratingCount,
      shortDescription: params.product.shortDescription,
      longDescription: params.product.longDescription,
      status: params.product.status,
      trendState: params.product.trendState,
      featuredState: params.product.featuredState,
      ingredients: params.product.ingredients,
      benefits: params.product.benefits,
      extraInfo1: params.product.extraInfo1,
      extraInfo2: params.product.extraInfo2,
      createdAt: params.product.createdAt,
      updatedAt: params.product.updatedAt,
      createdBy: params.product.createdBy,
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
      await this.deleteImageSafe(mainUpload.objectKey);
      await this.deleteMultipleImagesSafe(
        galleryUploads.map((upload) => upload.objectKey),
      );

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
  /* REPLACE MAIN IMAGE                               */
  /* ================================================= */

  async replaceMainImage(params: {
    productId: string;
    imageFile: MulterUploadFile;
  }): Promise<Product> {
    const product = await this.assertActiveProduct(params.productId);
    const oldMainImage = product.images.getMain();

    const uploadResult = await this.uploadService.uploadSingleImage({
      folder: UploadFolders.PRODUCTS,
      file: params.imageFile,
    });

    let updated!: Product;

    await this.prisma.$transaction(async (tx) => {
      updated = await this.productRepo.updateMainImage(
        params.productId,
        uploadResult.objectKey,
        tx,
      );
    });

    if (oldMainImage !== uploadResult.objectKey) {
      await this.deleteImageSafe(oldMainImage);
    }

    this.emitImagesChanged(updated);

    return updated;
  }

  /* ================================================= */
  /* REPLACE GALLERY IMAGE                            */
  /* ================================================= */

  async replaceGalleryImage(params: {
    productId: string;
    galleryImageId: string;
    imageFile: MulterUploadFile;
  }): Promise<Product> {
    const product = await this.assertActiveProduct(params.productId);

    const targetRecord = await this.productRepo.findGalleryRecordById(
      params.productId,
      params.galleryImageId,
    );

    if (!targetRecord) {
      throw new ValidationError(
        'GALLERY_IMAGE_NOT_FOUND',
        'Image to replace was not found in gallery',
      );
    }

    const uploadResult = await this.uploadService.uploadSingleImage({
      folder: UploadFolders.PRODUCTS,
      file: params.imageFile,
    });

    const oldObjectKey = this.normalizeImagePath(
      targetRecord.imageUrl,
    ) as string;

    let updated!: Product;

    await this.prisma.$transaction(async (tx) => {
      updated = await this.productRepo.replaceGalleryImageById(
        params.productId,
        params.galleryImageId,
        uploadResult.objectKey,
        tx,
      );
    });

    if (oldObjectKey !== uploadResult.objectKey) {
      await this.deleteImageSafe(oldObjectKey);
    }

    this.emitImagesChanged(updated);

    return updated;
  }

  /* ================================================= */
  /* ADD GALLERY IMAGE                                */
  /* ================================================= */

  async addGalleryImage(params: {
    productId: string;
    imageFile: MulterUploadFile;
  }): Promise<Product> {
    const product = await this.assertActiveProduct(params.productId);
    const currentGallery = product.images.getGallery();

    if (currentGallery.length >= 6) {
      throw new ValidationError(
        'TOO_MANY_GALLERY_IMAGES',
        'Maximum 6 gallery images allowed',
      );
    }

    const uploadResult = await this.uploadService.uploadSingleImage({
      folder: UploadFolders.PRODUCTS,
      file: params.imageFile,
    });

    let updated!: Product;

    await this.prisma.$transaction(async (tx) => {
      updated = await this.productRepo.addGalleryImage(
        params.productId,
        uploadResult.objectKey,
        currentGallery.length,
        tx,
      );
    });

    this.emitImagesChanged(updated);

    return updated;
  }

  /* ================================================= */
  /* DELETE GALLERY IMAGE                             */
  /* ================================================= */

  async deleteProductImage(params: {
    productId: string;
    galleryImageId: string;
  }): Promise<Product> {
    const product = await this.assertActiveProduct(params.productId);

    const targetRecord = await this.productRepo.findGalleryRecordById(
      params.productId,
      params.galleryImageId,
    );

    if (!targetRecord) {
      throw new ValidationError(
        'GALLERY_IMAGE_NOT_FOUND',
        'Image not found in gallery',
      );
    }

    const objectKey = this.normalizeImagePath(
      targetRecord.imageUrl,
    ) as string;

    let updated!: Product;

    await this.prisma.$transaction(async (tx) => {
      updated = await this.productRepo.deleteGalleryImageById(
        params.productId,
        params.galleryImageId,
        tx,
      );
    });

    await this.deleteImageSafe(objectKey);

    this.emitImagesChanged(updated);

    return updated;
  }

  /* ================================================= */
  /* REORDER GALLERY IMAGES                           */
  /* ================================================= */

  async reorderGalleryImages(params: {
    productId: string;
    galleryImageIds: string[];
  }): Promise<Product> {
    const product = await this.assertActiveProduct(params.productId);
    const records = await this.productRepo.findGalleryRecords(
      params.productId,
    );

    if (params.galleryImageIds.length !== records.length) {
      throw new ValidationError(
        'GALLERY_REORDER_INVALID',
        'Gallery reorder must include all gallery images',
      );
    }

    const recordIds = new Set(records.map((record) => record.id));

    for (const galleryImageId of params.galleryImageIds) {
      if (!recordIds.has(galleryImageId)) {
        throw new ValidationError(
          'GALLERY_IMAGE_NOT_FOUND',
          'One or more gallery images were not found',
        );
      }
    }

    const orderedKeys = params.galleryImageIds.map((galleryImageId) => {
      const record = records.find((item) => item.id === galleryImageId);
      return record!.imageUrl;
    });

    let updated!: Product;

    await this.prisma.$transaction(async (tx) => {
      updated = await this.productRepo.reorderGalleryImages(
        params.productId,
        params.galleryImageIds,
        tx,
      );
    });

    const reordered = product.updateImages({
      mainImage: product.images.getMain(),
      galleryImages: orderedKeys,
    });

    this.emitImagesChanged(reordered);

    return updated;
  }

  /* ================================================= */
  /* DELETE PRODUCT                                   */
  /* ================================================= */

  async deleteProduct(productId: string): Promise<{ id: string }> {
    const product = await this.getById(productId);

    const objectKeys = [
      product.images.getMain(),
      ...product.images.getGallery(),
    ].filter(Boolean);

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.hardDelete(productId, tx);
    });

    await this.deleteMultipleImagesSafe(objectKeys);

    this.productEvents.emitProductDisabled({
      productId: product.id,
    });

    return { id: product.id };
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
  }

  async unmarkFeatured(productId: string): Promise<void> {
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
  /* IMAGE URL RESOLUTION (PUBLIC)                     */
  /* ================================================= */

  async resolvePublicImages(params: {
    mainImage: string;
    galleryImageKeys: string[];
  }): Promise<{
    mainImageUrl: string;
    galleryImageUrls: string[];
  }> {
    return {
      mainImageUrl: await this.uploadService.generatePresignedGetUrl({
        objectKey: params.mainImage,
      }),
      galleryImageUrls: await Promise.all(
        params.galleryImageKeys.map((objectKey) =>
          this.uploadService.generatePresignedGetUrl({ objectKey }),
        ),
      ),
    };
  }

  /* ================================================= */
  /* HELPERS                                          */
  /* ================================================= */

  private async assertActiveProduct(productId: string): Promise<Product> {
    const product = await this.getById(productId);

    if (!product.isActive()) {
      throw new ValidationError(
        'PRODUCT_INACTIVE',
        'Inactive product cannot be updated',
      );
    }

    return product;
  }

  private emitImagesChanged(product: Product): void {
    this.productEvents.emitProductImagesChanged({
      productId: product.id,
      mainImage: product.images.getMain(),
      galleryImages: product.images.getGallery(),
    });
  }

  private async deleteImageSafe(objectKey?: string): Promise<void> {
    if (!objectKey) return;

    try {
      await this.uploadService.deleteObject({ objectKey });
    } catch {
      // silent fail (object may not exist)
    }
  }

  private async deleteMultipleImagesSafe(
    objectKeys: string[],
  ): Promise<void> {
    if (!objectKeys.length) return;

    try {
      await this.uploadService.deleteMultipleObjects({
        objectKeys,
      });
    } catch {
      // silent fail (objects may not exist)
    }
  }
}
