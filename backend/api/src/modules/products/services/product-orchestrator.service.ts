import { Injectable } from '@nestjs/common';

import { ProductService } from './product.service';
import { ProductRepository } from '../repositories/product.repository';
import { Product } from '../domain/models/product.model';
import { PublicProductQueryDto } from '../dtos/public-product-query.dto';
import { ValidationError } from '../../../common/errors';
import {
  ProductPublicResponse,
  ProductResponse,
  ProductResponseMapper,
  ProductSlugPageResponse,
} from '../mappers/product-response.mapper';
import { ProductDeleteOutcome } from '../domain/utils/product-lifecycle.util';
import { MulterUploadFile } from '../../uploads/interfaces/upload-file.interface';
import { ListProductsQueryDto } from '../dtos/list-products-query.dto';
import { ProductStatus } from '../domain/enums/product-status.enum';

export interface PaginatedProductResponse {
  items: ProductResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class ProductOrchestratorService {
  constructor(
    private readonly productService: ProductService,
    private readonly productRepository: ProductRepository,
    private readonly productResponseMapper: ProductResponseMapper,
  ) {}

  /* ================================================= */
  /* PRODUCT – READS (ADMIN / INTERNAL)                */
  /* ================================================= */

  async listProducts(
    query: ListProductsQueryDto,
  ): Promise<PaginatedProductResponse> {
    const result = await this.productService.listProducts(query);
    const galleryRecordsMap =
      await this.productRepository.findGalleryRecordsByProductIds(
        result.items.map(({ product }) => product.id),
      );

    const items = await Promise.all(
      result.items.map(async ({ product, category }) => {
        const response = await this.productResponseMapper.toResponse(
          product,
          galleryRecordsMap.get(product.id) ?? [],
        );

        return {
          ...response,
          categoryName: category.name,
        };
      }),
    );

    return {
      items,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  }

  async getAllProducts(
    query?: PublicProductQueryDto,
  ): Promise<ProductResponse[]> {
    const products = await this.productService.getAllProducts(query);
    const galleryRecordsMap =
      await this.productRepository.findGalleryRecordsByProductIds(
        products.map((product) => product.id),
      );

    return this.productResponseMapper.toResponseList(
      products,
      galleryRecordsMap,
    );
  }

  async getProductById(productId: string): Promise<ProductResponse> {
    const product = await this.productService.getById(productId);
    const galleryRecords =
      await this.productRepository.findGalleryRecords(productId);

    return this.productResponseMapper.toResponse(
      product,
      galleryRecords,
    );
  }

  async getProductBySlug(slug: string): Promise<Product> {
    return this.productService.getBySlug(slug);
  }

  /* ================================================= */
  /* PRODUCT – READS (PUBLIC)                          */
  /* ================================================= */

  async getPublicProducts(
    query: PublicProductQueryDto,
  ): Promise<
    {
      product: Product;
      category: { id: string; name: string };
    }[]
  > {
    return this.productService.getPublicProducts(query);
  }

  async getPublicProductResponses(
    query: PublicProductQueryDto,
  ): Promise<ProductPublicResponse[]> {
    const items = await this.productService.getPublicProducts(query);
    const galleryRecordsMap =
      await this.productRepository.findGalleryRecordsByProductIds(
        items.map(({ product }) => product.id),
      );

    return this.productResponseMapper.toPublicResponseList(
      items,
      galleryRecordsMap,
    );
  }

  async getPublicProductById(
    productId: string,
  ): Promise<ProductPublicResponse> {
    const result =
      await this.productService.getByIdWithCategory(productId);

    if (!result.product.canBeShown()) {
      throw new ValidationError(
        'PRODUCT_NOT_FOUND',
        'Product not found',
      );
    }

    const galleryRecords =
      await this.productRepository.findGalleryRecords(productId);

    return this.productResponseMapper.toPublicResponse(
      result.product,
      result.category,
      galleryRecords,
    );
  }

  async getPublicProductBySlug(
    slug: string,
  ): Promise<ProductSlugPageResponse> {
    const result =
      await this.productService.getBySlugWithCategory(slug);

    const galleryRecords =
      await this.productRepository.findGalleryRecords(
        result.product.id,
      );

    const productResponse =
      await this.productResponseMapper.toPublicResponse(
        result.product,
        result.category,
        galleryRecords,
      );

    if (result.product.canBeShown()) {
      return {
        availability: 'AVAILABLE',
        product: productResponse,
        relatedProducts: [],
      };
    }

    if (result.product.isUnavailableForDirectView()) {
      const relatedItems =
        await this.productRepository.findRelatedActiveProducts({
          categoryId: result.product.categoryId,
          excludeProductId: result.product.id,
          limit: 8,
        });

      const relatedGalleryMap =
        await this.productRepository.findGalleryRecordsByProductIds(
          relatedItems.map(({ product }) => product.id),
        );

      const relatedProducts =
        await this.productResponseMapper.toPublicResponseList(
          relatedItems,
          relatedGalleryMap,
        );

      return {
        availability: 'UNAVAILABLE',
        product: productResponse,
        relatedProducts,
        message: 'This product is no longer available.',
      };
    }

    throw new ValidationError(
      'PRODUCT_NOT_FOUND',
      'Product not found',
    );
  }

  /* ================================================= */
  /* PRODUCT – CREATE / UPDATE                        */
  /* ================================================= */

  async createProduct(params: {
    product: Product;
    mainImageFile: MulterUploadFile;
    galleryImageFiles?: MulterUploadFile[];
  }): Promise<ProductResponse> {
    const created = await this.productService.createProduct(params);
    const galleryRecords =
      await this.productRepository.findGalleryRecords(created.id);

    return this.productResponseMapper.toResponse(
      created,
      galleryRecords,
    );
  }

  async updateProductDetails(params: {
    productId: string;
    updates: {
      productName?: string;
      shortDescription?: string;
      longDescription?: string;
    };
  }): Promise<ProductResponse> {
    const updated = await this.productService.updateDetails(params);
    const galleryRecords =
      await this.productRepository.findGalleryRecords(updated.id);

    return this.productResponseMapper.toResponse(
      updated,
      galleryRecords,
    );
  }

  async updateProductPrice(params: {
    productId: string;
    originalPrice: number;
    discountPrice?: number;
  }): Promise<ProductResponse> {
    const updated = await this.productService.updatePrice(params);
    const galleryRecords =
      await this.productRepository.findGalleryRecords(updated.id);

    return this.productResponseMapper.toResponse(
      updated,
      galleryRecords,
    );
  }

  async updateProductIngredients(params: {
    productId: string;
    ingredients?: string;
    benefits?: string;
    extraInfo1?: string;
    extraInfo2?: string;
  }): Promise<ProductResponse> {
    const updated =
      await this.productService.updateIngredients(params);
    const galleryRecords =
      await this.productRepository.findGalleryRecords(updated.id);

    return this.productResponseMapper.toResponse(
      updated,
      galleryRecords,
    );
  }

  async replaceMainImage(params: {
    productId: string;
    imageFile: MulterUploadFile;
  }): Promise<ProductResponse> {
    const updated = await this.productService.replaceMainImage(params);
    const galleryRecords =
      await this.productRepository.findGalleryRecords(updated.id);

    return this.productResponseMapper.toResponse(
      updated,
      galleryRecords,
    );
  }

  async replaceGalleryImage(params: {
    productId: string;
    galleryImageId: string;
    imageFile: MulterUploadFile;
  }): Promise<ProductResponse> {
    const updated =
      await this.productService.replaceGalleryImage(params);
    const galleryRecords =
      await this.productRepository.findGalleryRecords(updated.id);

    return this.productResponseMapper.toResponse(
      updated,
      galleryRecords,
    );
  }

  async addGalleryImage(params: {
    productId: string;
    imageFile: MulterUploadFile;
  }): Promise<ProductResponse> {
    const updated = await this.productService.addGalleryImage(params);
    const galleryRecords =
      await this.productRepository.findGalleryRecords(updated.id);

    return this.productResponseMapper.toResponse(
      updated,
      galleryRecords,
    );
  }

  async deleteProductImage(params: {
    productId: string;
    galleryImageId: string;
  }): Promise<ProductResponse> {
    const updated =
      await this.productService.deleteProductImage(params);
    const galleryRecords =
      await this.productRepository.findGalleryRecords(updated.id);

    return this.productResponseMapper.toResponse(
      updated,
      galleryRecords,
    );
  }

  async reorderGalleryImages(params: {
    productId: string;
    galleryImageIds: string[];
  }): Promise<ProductResponse> {
    const updated =
      await this.productService.reorderGalleryImages(params);
    const galleryRecords =
      await this.productRepository.findGalleryRecords(updated.id);

    return this.productResponseMapper.toResponse(
      updated,
      galleryRecords,
    );
  }

  async deleteProduct(params: {
    productId: string;
    force?: boolean;
  }): Promise<{ id: string; outcome: ProductDeleteOutcome }> {
    return this.productService.deleteProduct(params.productId, {
      force: params.force,
    });
  }

  async restoreProduct(params: {
    productId: string;
  }): Promise<ProductResponse> {
    const restored = await this.productService.restoreProduct(
      params.productId,
    );
    const galleryRecords =
      await this.productRepository.findGalleryRecords(restored.id);

    return this.productResponseMapper.toResponse(
      restored,
      galleryRecords,
    );
  }

  /* ================================================= */
  /* PRODUCT – ENABLE / DISABLE                       */
  /* ================================================= */

  async updateProductStatus(params: {
    productId: string;
    status: ProductStatus;
  }): Promise<ProductResponse> {
    const updated = await this.productService.updateProductStatus(params);
    const galleryRecords =
      await this.productRepository.findGalleryRecords(updated.id);

    return this.productResponseMapper.toResponse(updated, galleryRecords);
  }

  async disableProduct(params: {
    productId: string;
  }): Promise<{ id: string; status: 'INACTIVE' }> {
    return this.productService.disableProduct(params.productId);
  }

  async enableProduct(params: {
    productId: string;
  }): Promise<{ id: string; status: 'ACTIVE' }> {
    return this.productService.enableProduct(params.productId);
  }

  /* ================================================= */
  /* PRODUCT – TRENDING                               */
  /* ================================================= */

  async markProductTrending(params: {
    productId: string;
  }): Promise<void> {
    return this.productService.markTrending(params.productId);
  }

  async unmarkProductTrending(params: {
    productId: string;
  }): Promise<void> {
    return this.productService.unmarkTrending(params.productId);
  }

  /* ================================================= */
  /* PRODUCT – FEATURED                               */
  /* ================================================= */

  async markProductFeatured(params: {
    productId: string;
  }): Promise<void> {
    return this.productService.markFeatured(params.productId);
  }

  async unmarkProductFeatured(params: {
    productId: string;
  }): Promise<void> {
    return this.productService.unmarkFeatured(params.productId);
  }

  async resolvePublicImages(params: {
    mainImage: string;
    galleryImageKeys: string[];
  }) {
    return this.productService.resolvePublicImages(params);
  }
}
