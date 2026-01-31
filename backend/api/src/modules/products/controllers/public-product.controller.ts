// src/modules/products/controllers/public-product.controller.ts

import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import { ProductOrchestratorService } from '../services/product-orchestrator.service';
import { ValidationError } from '../../../common/errors';
import { PublicProductListDto } from '../dtos/public-product-list.dto';
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
  async getPublicProducts(
    @Query() query: PublicProductQueryDto,
  ) {
    const products =
      await this.orchestrator.getPublicProducts(query);

    return {
      success: true,
      code: 'PUBLIC_PRODUCTS_FETCHED',
      message: 'Public products fetched successfully',
      data: products.map(({ product, category }) =>
        PublicProductListDto.fromDomain(product, category),
      ),
    };
  }

  /* ================================================= */
  /* PRODUCT – FETCH BY SLUG (PUBLIC)                  */
  /* ================================================= */

  @Get('slug/:slug')
  async getProductBySlug(
    @Param('slug') slug: string,
  ) {
    const result =
      await this.orchestrator.getPublicProductBySlug(slug);

    // (optional: can move this to service later)
    if (!result.product.canBeShown()) {
      throw new ValidationError(
        'PRODUCT_NOT_FOUND',
        'Product not found',
      );
    }

    return {
      success: true,
      code: 'PRODUCT_FETCHED',
      message: 'Product fetched successfully',
      data: PublicProductListDto.fromDomain(
        result.product,
        result.category,
      ),
    };
  }

  /* ================================================= */
  /* PRODUCT – FETCH BY ID (PUBLIC)                    */
  /* ================================================= */

  @Get(':productId')
  async getProductById(
    @Param('productId') productId: string,
  ) {
    const result =
      await this.orchestrator.getPublicProductById(
        productId,
      );

    if (!result.product.canBeShown()) {
      throw new ValidationError(
        'PRODUCT_NOT_FOUND',
        'Product not found',
      );
    }

    return {
      success: true,
      code: 'PRODUCT_FETCHED',
      message: 'Product fetched successfully',
      data: PublicProductListDto.fromDomain(
        result.product,
        result.category,
      ),
    };
  }
}
