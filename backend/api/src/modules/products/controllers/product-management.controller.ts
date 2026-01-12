import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ProductOrchestratorService } from '../services/product-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

/* DTOs */
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDetailsDto } from '../dtos/update-product-details.dto';
import { UpdateProductPriceDto } from '../dtos/update-product-price.dto';
import { UpdateProductImagesDto } from '../dtos/update-product-images.dto';

/* Domain */
import { Product } from '../domain/models/product.model';
import { randomUUID } from 'crypto';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductManagementController {
  constructor(
    private readonly orchestrator: ProductOrchestratorService,
  ) {}

  /* ================================================= */
/* PRODUCT – LIST (SUPER ADMIN ONLY)                  */
/* ================================================= */

@Get()
@Roles(ActorType.SUPER_ADMIN)
async getAllProducts() {
  const data = await this.orchestrator.getAllProducts();

  return {
    success: true,
    code: 'PRODUCTS_FETCHED',
    message: 'Products fetched successfully',
    data,
  };
}
  
  /* ================================================= */
  /* PRODUCT – READS                                   */
  /* ================================================= */

  @Get(':productId')
  async getProductById(@Param('productId') productId: string) {
    const data =
      await this.orchestrator.getProductById(productId);

    return {
      success: true,
      code: 'PRODUCT_FETCHED',
      message: 'Product fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCT – CREATE (SUPER ADMIN ONLY)                */
  /* ================================================= */

  @Post()
@Roles(ActorType.SUPER_ADMIN)
async createProduct(
  @Body() dto: CreateProductDto,
  @CurrentUser() user,
) {
  const product = Product.createNew({
    id: randomUUID(),
    stockItemId: dto.stockItemId,

    productName: dto.productName,
    originalPrice: dto.originalPrice,
    discountPrice: dto.discountPrice,

    mainImage: dto.mainImage,
    galleryImages: dto.galleryImages,

    shortDescription: dto.shortDescription,
    longDescription: dto.longDescription,

    isTrending: dto.isTrending,
    createdBy: user.actorId, // ✅ FIX
  });

  const data =
    await this.orchestrator.createProduct({ product });

  return {
    success: true,
    code: 'PRODUCT_CREATED',
    message: 'Product created successfully',
    data,
  };
}

  /* ================================================= */
  /* PRODUCT – UPDATE DETAILS (SUPER ADMIN ONLY)        */
  /* ================================================= */

  @Post(':productId/update')
  @Roles(ActorType.SUPER_ADMIN)
  async updateProductDetails(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDetailsDto,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.updateProductDetails({
        productId,
        updates: {
          productName: dto.productName,
          shortDescription: dto.shortDescription,
          longDescription: dto.longDescription,
        },
      });

    return {
      success: true,
      code: 'PRODUCT_UPDATED',
      message: 'Product details updated successfully',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCT – UPDATE PRICE (SUPER ADMIN ONLY)          */
  /* ================================================= */

  @Post(':productId/price')
  @Roles(ActorType.SUPER_ADMIN)
  async updateProductPrice(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductPriceDto,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.updateProductPrice({
        productId,
        originalPrice: dto.originalPrice,
        discountPrice: dto.discountPrice,
      });

    return {
      success: true,
      code: 'PRODUCT_PRICE_UPDATED',
      message: 'Product price updated successfully',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCT – UPDATE IMAGES (SUPER ADMIN ONLY)         */
  /* ================================================= */

  @Post(':productId/images')
  @Roles(ActorType.SUPER_ADMIN)
  async updateProductImages(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductImagesDto,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.updateProductImages({
        productId,
        mainImage: dto.mainImage,
        galleryImages: dto.galleryImages,
      });

    return {
      success: true,
      code: 'PRODUCT_IMAGES_UPDATED',
      message: 'Product images updated successfully',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCT – ENABLE / DISABLE (SUPER ADMIN ONLY)      */
  /* ================================================= */

  @Post(':productId/disable')
  @Roles(ActorType.SUPER_ADMIN)
  async disableProduct(
    @Param('productId') productId: string,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.disableProduct({ productId });

    return {
      success: true,
      code: 'PRODUCT_DISABLED',
      message: 'Product disabled successfully',
      data,
    };
  }

  @Post(':productId/enable')
  @Roles(ActorType.SUPER_ADMIN)
  async enableProduct(
    @Param('productId') productId: string,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.enableProduct({ productId });

    return {
      success: true,
      code: 'PRODUCT_ENABLED',
      message: 'Product enabled successfully',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCT – TRENDING (SUPER ADMIN ONLY)              */
  /* ================================================= */

  @Post(':productId/trending/on')
  @Roles(ActorType.SUPER_ADMIN)
  async markTrending(
    @Param('productId') productId: string,
    @CurrentUser() user,
  ) {
    await this.orchestrator.markProductTrending({
      productId,
    });

    return {
      success: true,
      code: 'PRODUCT_MARKED_TRENDING',
      message: 'Product marked as trending',
      data: null,
    };
  }

  @Post(':productId/trending/off')
  @Roles(ActorType.SUPER_ADMIN)
  async unmarkTrending(
    @Param('productId') productId: string,
    @CurrentUser() user,
  ) {
    await this.orchestrator.unmarkProductTrending({
      productId,
    });

    return {
      success: true,
      code: 'PRODUCT_UNMARKED_TRENDING',
      message: 'Product removed from trending',
      data: null,
    };
  }
}
