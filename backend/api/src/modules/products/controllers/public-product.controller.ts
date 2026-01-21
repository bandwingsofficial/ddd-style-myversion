// src/modules/products/controllers/public-product.controller.ts

import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { ProductOrchestratorService } from '../services/product-orchestrator.service';
import { ValidationError } from '../../../common/errors';
import { PublicProductListDto } from '../dtos/public-product-list.dto';

@Controller('public/products')
export class PublicProductController {
  constructor(
    private readonly orchestrator: ProductOrchestratorService,
  ) {}

  /* ================================================= */
  /* PRODUCT – PUBLIC CATALOG                          */
  /* ================================================= */

  @Get()
  async getPublicProducts() {
    const products =
      await this.orchestrator.getPublicProducts();

    return {
      success: true,
      code: 'PUBLIC_PRODUCTS_FETCHED',
      message: 'Public products fetched successfully',
      data: products.map(PublicProductListDto.fromDomain),
    };
  }

  /* ================================================= */
  /* PRODUCT – FETCH BY SLUG (PUBLIC)                  */
  /* ================================================= */

  @Get('slug/:slug')
  async getProductBySlug(
    @Param('slug') slug: string,
  ) {
    const product =
      await this.orchestrator.getProductBySlug(slug);

    if (!product.canBeShown()) {
      throw new ValidationError(
        'PRODUCT_NOT_FOUND',
        'Product not found',
      );
    }

    return {
      success: true,
      code: 'PRODUCT_FETCHED',
      message: 'Product fetched successfully',
      data: PublicProductListDto.fromDomain(product),
    };
  }

  /* ================================================= */
  /* PRODUCT – FETCH BY ID (PUBLIC)                    */
  /* ================================================= */

  @Get(':productId')
  async getProductById(
    @Param('productId') productId: string,
  ) {
    const product =
      await this.orchestrator.getProductById(productId);

    if (!product.canBeShown()) {
      throw new ValidationError(
        'PRODUCT_NOT_FOUND',
        'Product not found',
      );
    }

    return {
      success: true,
      code: 'PRODUCT_FETCHED',
      message: 'Product fetched successfully',
      data: PublicProductListDto.fromDomain(product),
    };
  }
}
