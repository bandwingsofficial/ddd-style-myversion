import { Injectable } from '@nestjs/common';

import { ProductService } from './product.service';
import { Product } from '../domain/models/product.model';

/**
 * Orchestrator = controller-facing layer
 * --------------------------------------------------
 * - Controllers talk ONLY to this class
 * - No domain logic
 * - No validation rules
 * - No data mutation
 * - Delegates to services
 */
@Injectable()
export class ProductOrchestratorService {
  constructor(
    private readonly productService: ProductService,
  ) {}

  /* ================================================= */
/* PRODUCT – READS                                   */
/* ================================================= */

async getAllProducts(): Promise<Product[]> {
  return this.productService.getAllProducts();
}
  async getPublicProducts() {
  return this.productService.getPublicProducts();
}

  
  /* ================================================= */
  /* PRODUCT – READS                                   */
  /* ================================================= */

  async getProductById(productId: string): Promise<Product> {
    return this.productService.getById(productId);
  }

  async getProductBySlug(slug: string): Promise<Product> {
    return this.productService.getBySlug(slug);
  }

  /* ================================================= */
  /* PRODUCT – CREATE / UPDATE / ENABLE / DISABLE       */
  /* ================================================= */

  async createProduct(params: {
    product: Product;
  }): Promise<Product> {
    return this.productService.createProduct(params);
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

  async updateProductImages(params: {
    productId: string;
    mainImage: string;
    galleryImages?: string[];
  }): Promise<Product> {
    return this.productService.updateImages(params);
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
  /* PRODUCT – TRENDING                                 */
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
}
