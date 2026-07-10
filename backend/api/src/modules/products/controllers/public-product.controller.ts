// src/modules/products/controllers/public-product.controller.ts

import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import { ProductOrchestratorService } from '../services/product-orchestrator.service';
import { PublicProductQueryDto } from '../dtos/public-product-query.dto';

@Controller('public/products')
export class PublicProductController {
  constructor(
    private readonly orchestrator: ProductOrchestratorService,
  ) {}

  /* ================================================= */
  /* PRODUCT – PUBLIC CATALOG (WITH FILTERS)           */
  /* ================================================= */

  @Get()
  async getPublicProducts(@Query() query: PublicProductQueryDto) {
    const products =
      await this.orchestrator.getPublicProductResponses(query);

    return {
      success: true,
      code: 'PUBLIC_PRODUCTS_FETCHED',
      message: 'Public products fetched successfully',
      data: products,
    };
  }

  /* ================================================= */
  /* PRODUCT – FETCH BY SLUG (PUBLIC)                  */
  /* ================================================= */

  @Get('slug/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    const data =
      await this.orchestrator.getPublicProductBySlug(slug);

    return {
      success: true,
      code: 'PRODUCT_FETCHED',
      message: 'Product fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCT – FETCH BY ID (PUBLIC)                    */
  /* ================================================= */

  @Get(':productId')
  async getProductById(@Param('productId') productId: string) {
    const data =
      await this.orchestrator.getPublicProductById(productId);

    return {
      success: true,
      code: 'PRODUCT_FETCHED',
      message: 'Product fetched successfully',
      data,
    };
  }
}
