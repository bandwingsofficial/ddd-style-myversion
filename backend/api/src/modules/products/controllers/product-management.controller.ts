import {
  Body,
  Controller,
  Get,
  Query,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';

import { ProductOrchestratorService } from '../services/product-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ValidationError } from '../../../common/errors';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

/* DTOs */
import { CreateProductDto } from '../dtos/create-product.dto';
import { UpdateProductDetailsDto } from '../dtos/update-product-details.dto';
import { UpdateProductPriceDto } from '../dtos/update-product-price.dto';
import { UpdateProductImagesDto } from '../dtos/update-product-images.dto';
import { UpdateProductIngredientsDto } from '../dtos/update-product-ingredients.dto';
import { DeleteProductImageDto } from '../dtos/delete-product-image.dto';

/* Domain */
import { Product } from '../domain/models/product.model';

/* Upload */
import { productImageUploadOptions } from '../../../common/upload/product-image.upload';
import { PublicProductQueryDto } from '../dtos/public-product-query.dto';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductManagementController {
  constructor(
    private readonly orchestrator: ProductOrchestratorService,
  ) {}

  /* ================================================= */
  /* PRODUCT – LIST (SUPER ADMIN ONLY)                 */
  /* ================================================= */

@Get()
@Roles(ActorType.SUPER_ADMIN)
async getAllProducts(
  @Query() query: PublicProductQueryDto, // ✅ add this only
) {
  const data = await this.orchestrator.getAllProducts(query);

  return {
    success: true,
    code: 'PRODUCTS_FETCHED',
    message: 'Products fetched successfully',
    data,
  };
}

  /* ================================================= */
  /* PRODUCT – READ                                   */
  /* ================================================= */

  @Get(':productId')
  async getProductById(
    @Param('productId') productId: string,
  ) {
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
  /* PRODUCT – CREATE (SUPER ADMIN ONLY)               */
  /* ================================================= */

  @Post()
  @Roles(ActorType.SUPER_ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mainImage', maxCount: 1 },
        { name: 'galleryImages', maxCount: 5 },
      ],
      productImageUploadOptions,
    ),
  )
  async createProduct(
    @Body() dto: CreateProductDto,
    @UploadedFiles()
    files: {
      mainImage?: Express.Multer.File[];
      galleryImages?: Express.Multer.File[];
    },
    @CurrentUser() user,
  ) {
    if (!files?.mainImage?.length) {
      throw new Error('Main image is required');
    }

    // ✅ BUILD DOMAIN OBJECT (FULL & FINAL)
    const product = Product.createNew({
      id: randomUUID(),

      categoryId: dto.categoryId,
      stockItemId: dto.stockItemId,

      productName: dto.productName,
      originalPrice: dto.originalPrice,
      discountPrice: dto.discountPrice,

      mainImage: `images/products/${files.mainImage[0].filename}`,
      galleryImages: files.galleryImages?.map(
        (f) => `images/products/${f.filename}`,
      ),

      tags: dto.tags ?? [],

      unitValue: dto.unitValue,
      unitType: dto.unitType,
      ratingAverage: 0,
      ratingCount: 0,

      shortDescription: dto.shortDescription,
      longDescription: dto.longDescription,

      isTrending: dto.isTrending ?? false,
      createdBy: user.actorId,
    });

    const data =
      await this.orchestrator.createProduct(product);

    return {
      success: true,
      code: 'PRODUCT_CREATED',
      message: 'Product created successfully',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCT – UPDATE DETAILS                         */
  /* ================================================= */

  @Post(':productId/update')
  @Roles(ActorType.SUPER_ADMIN)
  async updateProductDetails(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDetailsDto,
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
  /* PRODUCT – UPDATE PRICE                           */
  /* ================================================= */

  @Post(':productId/price')
  @Roles(ActorType.SUPER_ADMIN)
  async updateProductPrice(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductPriceDto,
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
  /* PRODUCT – UPDATE INGREDIENTS                     */
  /* ================================================= */
  
  @Post(':productId/ingredients')
  @Roles(ActorType.SUPER_ADMIN)
  async updateProductIngredients(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductIngredientsDto,
  ) {
    const data =
      await this.orchestrator.updateProductIngredients({
        productId,
        ingredients: dto.ingredients,
        benefits: dto.benefits,
        extraInfo1: dto.extraInfo1,
        extraInfo2: dto.extraInfo2,
      });

    return {
      success: true,
      code: 'PRODUCT_INGREDIENTS_UPDATED',
      message: 'Product ingredients updated successfully',
      data,
    };
  }


/* ================================================= */
/* PRODUCT – UPDATE IMAGES                          */
/* ================================================= */

@Post(':productId/images')
@Roles(ActorType.SUPER_ADMIN)
@UseInterceptors(
  FileFieldsInterceptor(
    [{ name: 'galleryImages', maxCount: 1 }],
    productImageUploadOptions,
  ),
)
async updateProductImages(
  @Param('productId') productId: string,
  @Body() dto: UpdateProductImagesDto,
  @UploadedFiles()
  files: { galleryImages?: Express.Multer.File[] },
) {
  if (!dto.replaceImage) {
    throw new ValidationError(
      'REPLACE_IMAGE_REQUIRED',
      'replaceImage is required',
    );
  }

  if (!files?.galleryImages?.length) {
    throw new ValidationError(
      'NEW_IMAGE_REQUIRED',
      'New image file is required',
    );
  }

  const newImagePath = `images/products/${files.galleryImages[0].filename}`;

  const data = await this.orchestrator.updateProductImages({
  productId,
  replaceImage: dto.replaceImage,
  galleryImages: [newImagePath], // ✅ MUST be array
});

  return {
    success: true,
    code: 'PRODUCT_IMAGE_REPLACED',
    message: 'Gallery image replaced successfully',
    data,
  };
}


/* ================================================= */
/* PRODUCT – DELETE GALLERY IMAGE                   */
/* ================================================= */

@Post(':productId/images/delete')
@Roles(ActorType.SUPER_ADMIN)
async deleteProductImage(
  @Param('productId') productId: string,
  @Body() dto: DeleteProductImageDto,
) {
  const data =
    await this.orchestrator.deleteProductImage({
      productId,
      imagePath: dto.imagePath,
    });

  return {
    success: true,
    code: 'PRODUCT_IMAGE_DELETED',
    message: 'Product image deleted successfully',
    data,
  };
}

  /* ================================================= */
  /* PRODUCT – ENABLE / DISABLE                       */
  /* ================================================= */

  @Post(':productId/disable')
  @Roles(ActorType.SUPER_ADMIN)
  async disableProduct(
    @Param('productId') productId: string,
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
  /* PRODUCT – TRENDING                               */
  /* ================================================= */

  @Post(':productId/trending/on')
  @Roles(ActorType.SUPER_ADMIN)
  async markTrending(
    @Param('productId') productId: string,
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

  /* ================================================= */
  /* PRODUCT – FEATURED                               */
  /* ================================================= */

  @Post(':productId/featured/on')
  @Roles(ActorType.SUPER_ADMIN)
  async markFeatured(
    @Param('productId') productId: string,
  ) {
    await this.orchestrator.markProductFeatured({
      productId,
    });

    return {
      success: true,
      code: 'PRODUCT_MARKED_FEATURED',
      message: 'Product marked as featured',
      data: null,
    };
  }

  @Post(':productId/featured/off')
  @Roles(ActorType.SUPER_ADMIN)
  async unmarkFeatured(
    @Param('productId') productId: string,
  ) {
    await this.orchestrator.unmarkProductFeatured({
      productId,
    });

    return {
      success: true,
      code: 'PRODUCT_UNMARKED_FEATURED',
      message: 'Product removed from featured',
      data: null,
    };
  } 
}
