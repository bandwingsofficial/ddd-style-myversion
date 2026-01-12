import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { Product } from '../domain/models/product.model';
import { ProductRepository } from '../repositories/product.repository';

import { ValidationError } from '../../../common/errors';
import { ProductStatus } from '../domain/enums/product-status.enum';

/* 🔥 EVENTS */
import { ProductEventsService } from '../events/product-events.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productRepo: ProductRepository,
    private readonly productEvents: ProductEventsService, // ✅ ADD
  ) {}

  /* ================================================= */
/* READ – ALL PRODUCTS                               */
/* ================================================= */

async getAllProducts(): Promise<Product[]> {
  return this.productRepo.findAll();
}
  /* ================================================= */
/* READ – PUBLIC PRODUCTS                            */
/* ================================================= */

async getPublicProducts(): Promise<Product[]> {
  const products = await this.productRepo.findPublicProducts();

  return products.filter(product => product.canBeShown());
}

  
  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

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
  /* CREATE PRODUCT                                    */
  /* ================================================= */

  async createProduct(params: {
    product: Product;
  }): Promise<Product> {
    let created!: Product;

    await this.prisma.$transaction(async (tx) => {
      created = await this.productRepo.create(params.product, tx);
    });

    /* 🔥 EVENT */
    this.productEvents.emitProductCreated({
      productId: created.id,
    });

    return created;
  }

  /* ================================================= */
  /* UPDATE DETAILS                                    */
  /* ================================================= */

  async updateDetails(params: {
    productId: string;
    updates: {
      productName?: string;
      shortDescription?: string;
      longDescription?: string;
    };
  }): Promise<Product> {
    const product = await this.productRepo.findById(params.productId);
    if (!product) {
      throw new ValidationError('PRODUCT_NOT_FOUND', 'Product not found');
    }

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

    /* 🔥 EVENT */
    this.productEvents.emitProductUpdated({
      productId: updated.id,
      name: updated.name.getValue(),
      slug: updated.slug.getValue(),
    });

    return updated;
  }

  /* ================================================= */
  /* UPDATE PRICE                                      */
  /* ================================================= */

  async updatePrice(params: {
    productId: string;
    originalPrice: number;
    discountPrice?: number;
  }): Promise<Product> {
    const product = await this.productRepo.findById(params.productId);
    if (!product) {
      throw new ValidationError('PRODUCT_NOT_FOUND', 'Product not found');
    }

    if (!product.isActive()) {
      throw new ValidationError(
        'PRODUCT_INACTIVE',
        'Inactive product cannot be updated',
      );
    }

    const updated = product.updatePrice({
      originalPrice: params.originalPrice,
      discountPrice: params.discountPrice,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updatePrice(updated, tx);
    });

    /* 🔥 EVENT (price affects listing → treat as update) */
    this.productEvents.emitProductUpdated({
      productId: updated.id,
      name: updated.name.getValue(),
      slug: updated.slug.getValue(),
    });

    return updated;
  }

  /* ================================================= */
  /* UPDATE IMAGES                                     */
  /* ================================================= */

  async updateImages(params: {
    productId: string;
    mainImage: string;
    galleryImages?: string[];
  }): Promise<Product> {
    const product = await this.productRepo.findById(params.productId);
    if (!product) {
      throw new ValidationError('PRODUCT_NOT_FOUND', 'Product not found');
    }

    if (!product.isActive()) {
      throw new ValidationError(
        'PRODUCT_INACTIVE',
        'Inactive product cannot be updated',
      );
    }

    const updated = product.updateImages({
      mainImage: params.mainImage,
      galleryImages: params.galleryImages,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateImages(updated, tx);
    });

    /* 🔥 EVENT */
    this.productEvents.emitProductUpdated({
      productId: updated.id,
      name: updated.name.getValue(),
      slug: updated.slug.getValue(),
    });

    return updated;
  }

  /* ================================================= */
  /* TRENDING                                          */
  /* ================================================= */

  async markTrending(productId: string): Promise<void> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new ValidationError('PRODUCT_NOT_FOUND', 'Product not found');
    }

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

    /* 🔥 EVENT */
    this.productEvents.emitProductTrendingChanged({
      productId: updated.id,
      isTrending: true,
    });
  }

  async unmarkTrending(productId: string): Promise<void> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new ValidationError('PRODUCT_NOT_FOUND', 'Product not found');
    }

    const updated = product.unmarkTrending();

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateTrending(updated, tx);
    });

    /* 🔥 EVENT */
    this.productEvents.emitProductTrendingChanged({
      productId: updated.id,
      isTrending: false,
    });
  }

  /* ================================================= */
  /* ENABLE / DISABLE                                  */
  /* ================================================= */

  async disableProduct(
    productId: string,
  ): Promise<{ id: string; status: 'INACTIVE' }> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new ValidationError('PRODUCT_NOT_FOUND', 'Product not found');
    }

    if (!product.isActive()) {
      return { id: product.id, status: 'INACTIVE' };
    }

    const disabled = product.disable();

    await this.prisma.$transaction(async (tx) => {
      await this.productRepo.updateStatus(disabled, tx);
    });

    /* 🔥 EVENT */
    this.productEvents.emitProductDisabled({
      productId: product.id,
    });

    return { id: product.id, status: 'INACTIVE' };
  }

  async enableProduct(
    productId: string,
  ): Promise<{ id: string; status: 'ACTIVE' }> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new ValidationError('PRODUCT_NOT_FOUND', 'Product not found');
    }

    if (product.isActive()) {
      return { id: product.id, status: 'ACTIVE' };
    }

    const enabled = Product.rehydrate({
      id: product.id,
      stockItemId: product.stockItemId,

      name: product.name,
      slug: product.slug,
      price: product.price,
      images: product.images,

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

    /* 🔥 EVENT */
    this.productEvents.emitProductEnabled({
      productId: product.id,
    });

    return { id: product.id, status: 'ACTIVE' };
  }
}
