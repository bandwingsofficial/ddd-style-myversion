import { Injectable } from '@nestjs/common';

import { ProductService } from './product.service';
import { Product } from '../domain/models/product.model';
import { PublicProductQueryDto } from '../dtos/public-product-query.dto';

@Injectable()
export class ProductOrchestratorService {
  constructor(
    private readonly productService: ProductService,
  ) {}

  /* ================================================= */
  /* PRODUCT – READS (ADMIN / INTERNAL)                */
  /* ================================================= */

async getAllProducts(query?: PublicProductQueryDto) {
  return this.productService.getAllProducts(query);
}

  async getProductById(
    productId: string,
  ): Promise<Product> {
    return this.productService.getById(productId);
  }

  async getProductBySlug(
    slug: string,
  ): Promise<Product> {
    return this.productService.getBySlug(slug);
  }

  /* ================================================= */
  /* PRODUCT – READS (PUBLIC)                          */
  /* ================================================= */

async getPublicProducts(query: PublicProductQueryDto) {
  return this.productService.getPublicProducts(query);
}

  async getPublicProductById(
    productId: string,
  ): Promise<{
    product: Product;
    category: { id: string; name: string };
  }> {
    return this.productService.getByIdWithCategory(
      productId,
    );
  }

  async getPublicProductBySlug(
    slug: string,
  ): Promise<{
    product: Product;
    category: { id: string; name: string };
  }> {
    return this.productService.getBySlugWithCategory(
      slug,
    );
  }

  /* ================================================= */
  /* PRODUCT – CREATE / UPDATE                        */
  /* ================================================= */

  async createProduct(
    product: Product,
  ): Promise<Product> {
    return this.productService.createProduct(product);
  }

  async updateProductDetails(params: {
    productId: string;
    updates: {
      productName?: string;
      shortDescription?: string;
      longDescription?: string;
    };
  }): Promise<Product> {
    return this.productService.updateDetails(params);
  }

  async updateProductPrice(params: {
    productId: string;
    originalPrice: number;
    discountPrice?: number;
  }): Promise<Product> {
    return this.productService.updatePrice(params);
  }

  async updateProductIngredients(params: {
    productId: string;
    ingredients?: string;
    benefits?: string;
    extraInfo1?: string;
    extraInfo2?: string;
  }): Promise<Product> {
    return this.productService.updateIngredients(params);
  }

 async updateProductImages(params: {
  productId: string;
  mainImage?: string;
  galleryImages?: string[];
  replaceImage?: string; // 🔥 ADD THIS
}): Promise<Product> {
  return this.productService.updateImages(params);
}

async deleteProductImage(params: {
  productId: string;
  imagePath: string;
}): Promise<Product> {
  return this.productService.deleteProductImage(params);
}


  /* ================================================= */
  /* PRODUCT – ENABLE / DISABLE                       */
  /* ================================================= */

  async disableProduct(params: {
    productId: string;
  }): Promise<{ id: string; status: 'INACTIVE' }> {
    return this.productService.disableProduct(
      params.productId,
    );
  }

  async enableProduct(params: {
    productId: string;
  }): Promise<{ id: string; status: 'ACTIVE' }> {
    return this.productService.enableProduct(
      params.productId,
    );
  }

  /* ================================================= */
  /* PRODUCT – TRENDING                               */
  /* ================================================= */

  async markProductTrending(params: {
    productId: string;
  }): Promise<void> {
    return this.productService.markTrending(
      params.productId,
    );
  }

  async unmarkProductTrending(params: {
    productId: string;
  }): Promise<void> {
    return this.productService.unmarkTrending(
      params.productId,
    );
  }

  /* ================================================= */
  /* PRODUCT – FEATURED                               */
  /* ================================================= */

  async markProductFeatured(params: {
    productId: string;
  }): Promise<void> {
    return this.productService.markFeatured(
      params.productId,
    );
  }

  async unmarkProductFeatured(params: {
    productId: string;
  }): Promise<void> {
    return this.productService.unmarkFeatured(
      params.productId,
    );
  }
}
