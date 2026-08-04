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
import { PublicProductSearchQueryDto } from '../dtos/public-product-search-query.dto';
import { ListProductsQueryDto } from '../dtos/list-products-query.dto';
import { UploadFolders } from '../../uploads/constants/upload-folders.constants';
import { UploadService } from '../../uploads/services/upload.service';
import { MulterUploadFile } from '../../uploads/interfaces/upload-file.interface';
import {
  DeleteAnalysis,
  DELETE_ERROR_CODES,
} from '../../../common/types/delete-analysis.types';
import {
  ProductDeleteOutcome,
  resolveProductDeleteOutcome,
  shouldRemoveProductFromCartsAndOutlets,
} from '../domain/utils/product-lifecycle.util';

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

  async listProducts(query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const result = await this.productRepo.findPaginatedAdmin({
      page,
      limit,
      search: query.search,
      categoryId: query.categoryId,
      status: query.status,
    });

    return {
      items: result.items,
      page,
      limit,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / limit)),
    };
  }

  async getPublicProducts(query: PublicProductQueryDto) {
    return this.productRepo.findAll('public', query);
  }

  async searchPublicProducts(query: PublicProductSearchQueryDto) {
    const q = query.q?.trim() ?? '';
    if (!q) {
      return {
        items: [],
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        total: 0,
        totalPages: 0,
      };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const result = await this.productRepo.searchPublicPaginated({
      q,
      page,
      limit,
      categoryId: query.categoryId,
      outletId: query.outletId,
      sort: query.sort,
    });

    return {
      items: result.items,
      page,
      limit,
      total: result.total,
      totalPages:
        result.total === 0 ? 0 : Math.ceil(result.total / limit),
    };
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
    const category = await this.prisma.category.findUnique({
      where: { id: params.product.categoryId },
      select: { id: true, status: true },
    });

    if (!category) {
      throw new ValidationError(
        'CATEGORY_NOT_FOUND',
        'Category does not exist',
        { errors: { categoryId: 'Category does not exist.' } },
      );
    }

    if (category.status !== 'ACTIVE') {
      throw new ValidationError(
        'CATEGORY_INACTIVE',
        'Only active categories can be assigned to products.',
        { errors: { categoryId: 'Only active categories can be assigned.' } },
      );
    }

    const normalizedName = params.product.name.getValue();
    const existingByName =
      await this.productRepo.findByProductName(normalizedName);

    if (existingByName) {
      throw new ValidationError(
        'PRODUCT_ALREADY_EXISTS',
        'Product with this name already exists.',
        { errors: { productName: 'Product with this name already exists.' } },
      );
    }

    const existingBySlug = await this.productRepo.findBySlug(
      params.product.slug.getValue(),
    );

    if (existingBySlug) {
      throw new ValidationError(
        'PRODUCT_ALREADY_EXISTS',
        'Product with this name already exists.',
        { errors: { productName: 'Product with this name already exists.' } },
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
        throw new ValidationError(
          'PRODUCT_ALREADY_EXISTS',
          'Product with this name already exists.',
          { errors: { productName: 'Product with this name already exists.' } },
        );
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
        'PRODUCT_INACTIVE_UPDATE',
        'Cannot edit inactive product. Activate it first.',
        {
          errors: {
            productName: 'Cannot edit inactive product. Activate it first.',
          },
        },
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
        'PRODUCT_INACTIVE_UPDATE',
        'Cannot edit inactive product. Activate it first.',
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
        'PRODUCT_INACTIVE_UPDATE',
        'Cannot edit inactive product. Activate it first.',
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

    const oldObjectKey = this.normalizeImagePath(targetRecord.imageUrl);

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

    const objectKey = this.normalizeImagePath(targetRecord.imageUrl);

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
    const records = await this.productRepo.findGalleryRecords(params.productId);

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
      return record.imageUrl;
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

  async analyzeProductDelete(productId: string): Promise<DeleteAnalysis> {
    await this.getById(productId);

    const [cartCount, orderCount, outletCount] = await Promise.all([
      this.productRepo.countCartItemsByProductId(productId),
      this.productRepo.countOrderItemsByProductId(productId),
      this.productRepo.countOutletProductsByProductId(productId),
    ]);

    const removableDependencies = [];

    if (cartCount > 0) {
      removableDependencies.push({
        type: 'CART_ITEMS',
        label: 'Cart Items',
        count: cartCount,
      });
    }

    if (outletCount > 0) {
      removableDependencies.push({
        type: 'OUTLET_PRODUCTS',
        label: 'Outlet Product Assignments',
        count: outletCount,
      });
    }

    const willArchive = orderCount > 0;
    const canDelete = !willArchive && removableDependencies.length === 0;
    const canForceDelete = !willArchive && removableDependencies.length > 0;

    return {
      canDelete,
      canForceDelete,
      permanentBlockers: [],
      removableDependencies,
      forceDeleteActions: canForceDelete
        ? [
            'Remove all outlet product assignments',
            'Remove active cart items referencing this product',
            'Delete gallery images and main image',
            'Delete related upload records and storage objects',
            'Permanently delete the product',
          ]
        : undefined,
    };
  }

  async deleteProduct(
    productId: string,
    options?: { force?: boolean },
  ): Promise<{ id: string; outcome: ProductDeleteOutcome }> {
    const product = await this.getById(productId);
    const [analysis, orderCount] = await Promise.all([
      this.analyzeProductDelete(productId),
      this.productRepo.countOrderItemsByProductId(productId),
    ]);

    const outcome = resolveProductDeleteOutcome(orderCount);

    if (outcome === 'ARCHIVED') {
      let outletAssignmentsRemoved = 0;
      let cartItemsRemoved = 0;

      await this.prisma.$transaction(async (tx) => {
        outletAssignmentsRemoved =
          await this.productRepo.deleteOutletProductsByProductId(productId, tx);
        cartItemsRemoved = await this.productRepo.deleteCartItemsByProductId(
          productId,
          tx,
        );
        await this.productRepo.archiveProduct(product, tx);
      });

      this.productEvents.emitProductInactivated({
        productId: product.id,
        outletAssignmentsRemoved,
        cartItemsRemoved,
      });

      if (outletAssignmentsRemoved > 0) {
        this.productEvents.emitOutletAssignmentsRemoved({
          productId: product.id,
          count: outletAssignmentsRemoved,
        });
      }

      return { id: product.id, outcome: 'ARCHIVED' };
    }

    if (!analysis.canDelete && !options?.force) {
      if (analysis.canForceDelete) {
        throw new ValidationError(
          DELETE_ERROR_CODES.REQUIRES_FORCE,
          `This product is referenced by ${analysis.removableDependencies
            .map((item) => `${item.count} ${item.label.toLowerCase()}`)
            .join(' and ')}.`,
          { deleteAnalysis: analysis },
        );
      }

      throw new ValidationError(
        DELETE_ERROR_CODES.BLOCKED,
        'Cannot delete this product.',
        { deleteAnalysis: analysis },
      );
    }

    const objectKeys = [
      product.images.getMain(),
      ...product.images.getGallery(),
    ].filter(Boolean);

    await this.prisma.$transaction(async (tx) => {
      if (options?.force) {
        await this.productRepo.deleteCartItemsByProductId(productId, tx);
        await this.productRepo.deleteOutletProductsByProductId(productId, tx);
      }

      await this.productRepo.hardDelete(productId, tx);

      for (const objectKey of objectKeys) {
        await this.uploadService.deleteObject({ objectKey });
      }
    });

    this.productEvents.emitProductDisabled({
      productId: product.id,
    });

    return { id: product.id, outcome: 'PERMANENT' };
  }

  async restoreProduct(productId: string): Promise<Product> {
    const product = await this.getById(productId);

    if (!product.isRestorable()) {
      throw new ValidationError(
        'PRODUCT_NOT_RESTORABLE',
        'Only archived or soft-deleted products can be restored.',
      );
    }

    let restored!: Product;

    await this.prisma.$transaction(async (tx) => {
      restored = await this.productRepo.restoreProduct(product, tx);
    });

    this.productEvents.emitProductEnabled({
      productId: restored.id,
    });

    return restored;
  }

  private buildPermanentDeleteMessage(analysis: DeleteAnalysis): string {
    if (analysis.permanentBlockers.length === 0) {
      return 'Cannot delete this product.';
    }

    const details = analysis.permanentBlockers
      .map((blocker) => `${blocker.count} ${blocker.label}`)
      .join(', ');

    return `Cannot delete this product because it has permanent business records: ${details}. Those records must be retained.`;
  }

  async updateProductStatus(params: {
    productId: string;
    status: ProductStatus;
  }): Promise<Product> {
    const product = await this.getById(params.productId);
    const updated = product.changeStatus(params.status);

    if (updated.status === product.status) {
      return product;
    }

    let outletAssignmentsRemoved = 0;
    let cartItemsRemoved = 0;

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateStatus(updated, tx);

      if (shouldRemoveProductFromCartsAndOutlets(updated.status)) {
        outletAssignmentsRemoved =
          await this.productRepo.deleteOutletProductsByProductId(
            updated.id,
            tx,
          );
        cartItemsRemoved = await this.productRepo.deleteCartItemsByProductId(
          updated.id,
          tx,
        );
      }
    });

    if (updated.isActive()) {
      this.productEvents.emitProductEnabled({
        productId: updated.id,
      });
    } else {
      this.productEvents.emitProductInactivated({
        productId: updated.id,
        outletAssignmentsRemoved,
        cartItemsRemoved,
      });

      if (outletAssignmentsRemoved > 0) {
        this.productEvents.emitOutletAssignmentsRemoved({
          productId: updated.id,
          count: outletAssignmentsRemoved,
        });
      }
    }

    return updated;
  }

  /* ================================================= */
  /* TRENDING                                         */
  /* ================================================= */

  async markTrending(productId: string): Promise<void> {
    const product = await this.getById(productId);

    if (!product.isActive()) {
      throw new ValidationError(
        'PRODUCT_INACTIVE_UPDATE',
        'Cannot edit inactive product. Activate it first.',
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
    const product = await this.assertActiveProduct(productId);

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
        'PRODUCT_INACTIVE_UPDATE',
        'Cannot edit inactive product. Activate it first.',
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

  async enableProduct(
    productId: string,
  ): Promise<{ id: string; status: 'ACTIVE' }> {
    const updated = await this.updateProductStatus({
      productId,
      status: ProductStatus.ACTIVE,
    });

    return { id: updated.id, status: 'ACTIVE' };
  }

  async disableProduct(
    productId: string,
  ): Promise<{ id: string; status: 'INACTIVE' }> {
    const updated = await this.updateProductStatus({
      productId,
      status: ProductStatus.INACTIVE,
    });

    return { id: updated.id, status: 'INACTIVE' };
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
        'PRODUCT_INACTIVE_UPDATE',
        'Cannot edit inactive product. Activate it first.',
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

  private async deleteMultipleImagesSafe(objectKeys: string[]): Promise<void> {
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
