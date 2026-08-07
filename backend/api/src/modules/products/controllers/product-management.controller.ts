import {
  Body,
  Controller,
  Delete,
  Get,
  Query,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
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
import { UpdateProductIngredientsDto } from '../dtos/update-product-ingredients.dto';
import { DeleteProductImageDto } from '../dtos/delete-product-image.dto';
import { ReplaceProductGalleryImageDto } from '../dtos/replace-product-gallery-image.dto';
import { ReorderProductGalleryDto } from '../dtos/reorder-product-gallery.dto';

/* Domain */
import { Product } from '../domain/models/product.model';

/* Upload */
import { productImageUploadOptions } from '../../uploads/validators/multer-memory.options';
import { PublicProductQueryDto } from '../dtos/public-product-query.dto';
import { ListProductsQueryDto } from '../dtos/list-products-query.dto';
import { UpdateProductStatusDto } from '../dtos/update-product-status.dto';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.SUPER_ADMIN)
export class ProductManagementController {
  constructor(private readonly orchestrator: ProductOrchestratorService) {}

  /* ================================================= */
  /* PRODUCT – LIST (SUPER ADMIN ONLY)                 */
  /* ================================================= */

  @Get()
  async listProducts(@Query() query: ListProductsQueryDto) {
    const data = await this.orchestrator.listProducts(query);

    return {
      success: true,
      message: 'Products fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCT – READ                                   */
  /* ================================================= */

  @Get(':productId')
  async getProductById(@Param('productId') productId: string) {
    const data = await this.orchestrator.getProductById(productId);

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
      throw new ValidationError(
        'MAIN_IMAGE_REQUIRED',
        'Main image is required',
      );
    }

    const product = Product.createNew({
      id: randomUUID(),
      categoryId: dto.categoryId,
      productName: dto.productName,
      originalPrice: dto.originalPrice,
      discountPrice: dto.discountPrice,
      mainImage: 'pending',
      galleryImages: [],
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

    const data = await this.orchestrator.createProduct({
      product,
      mainImageFile: files.mainImage[0],
      galleryImageFiles: files.galleryImages,
    });

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
    const data = await this.orchestrator.updateProductDetails({
      productId,
      updates: {
        categoryId: dto.categoryId,
        productName: dto.productName,
        shortDescription: dto.shortDescription,
        longDescription: dto.longDescription,
        unitValue: dto.unitValue,
        unitType: dto.unitType,
        tags: dto.tags,
        isTrending: dto.isTrending,
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
    const data = await this.orchestrator.updateProductPrice({
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
    const data = await this.orchestrator.updateProductIngredients({
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
  /* PRODUCT – REPLACE MAIN IMAGE                     */
  /* ================================================= */

  @Post(':productId/images/main')
  @Roles(ActorType.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('mainImage', productImageUploadOptions))
  async replaceMainImage(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new ValidationError(
        'MAIN_IMAGE_REQUIRED',
        'Main image file is required',
      );
    }

    const data = await this.orchestrator.replaceMainImage({
      productId,
      imageFile: file,
    });

    return {
      success: true,
      code: 'PRODUCT_MAIN_IMAGE_REPLACED',
      message: 'Main image replaced successfully',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCT – REPLACE GALLERY IMAGE                  */
  /* ================================================= */

  @Post(':productId/images/replace')
  @Roles(ActorType.SUPER_ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'galleryImages', maxCount: 1 }],
      productImageUploadOptions,
    ),
  )
  async replaceGalleryImage(
    @Param('productId') productId: string,
    @Body() dto: ReplaceProductGalleryImageDto,
    @UploadedFiles()
    files: { galleryImages?: Express.Multer.File[] },
  ) {
    if (!files?.galleryImages?.length) {
      throw new ValidationError(
        'NEW_IMAGE_REQUIRED',
        'New image file is required',
      );
    }

    const data = await this.orchestrator.replaceGalleryImage({
      productId,
      galleryImageId: dto.galleryImageId,
      imageFile: files.galleryImages[0],
    });

    return {
      success: true,
      code: 'PRODUCT_GALLERY_IMAGE_REPLACED',
      message: 'Gallery image replaced successfully',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCT – ADD GALLERY IMAGE                      */
  /* ================================================= */

  @Post(':productId/images/add')
  @Roles(ActorType.SUPER_ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'galleryImages', maxCount: 1 }],
      productImageUploadOptions,
    ),
  )
  async addGalleryImage(
    @Param('productId') productId: string,
    @UploadedFiles()
    files: { galleryImages?: Express.Multer.File[] },
  ) {
    if (!files?.galleryImages?.length) {
      throw new ValidationError(
        'NEW_IMAGE_REQUIRED',
        'Gallery image file is required',
      );
    }

    const data = await this.orchestrator.addGalleryImage({
      productId,
      imageFile: files.galleryImages[0],
    });

    return {
      success: true,
      code: 'PRODUCT_GALLERY_IMAGE_ADDED',
      message: 'Gallery image added successfully',
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
    const data = await this.orchestrator.deleteProductImage({
      productId,
      galleryImageId: dto.galleryImageId,
    });

    return {
      success: true,
      code: 'PRODUCT_IMAGE_DELETED',
      message: 'Product image deleted successfully',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCT – REORDER GALLERY                        */
  /* ================================================= */

  @Post(':productId/images/reorder')
  @Roles(ActorType.SUPER_ADMIN)
  async reorderGalleryImages(
    @Param('productId') productId: string,
    @Body() dto: ReorderProductGalleryDto,
  ) {
    const data = await this.orchestrator.reorderGalleryImages({
      productId,
      galleryImageIds: dto.galleryImageIds,
    });

    return {
      success: true,
      code: 'PRODUCT_GALLERY_REORDERED',
      message: 'Gallery images reordered successfully',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCT – HARD DELETE                            */
  /* ================================================= */

  @Patch(':productId/status')
  async updateProductStatus(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductStatusDto,
  ) {
    const data = await this.orchestrator.updateProductStatus({
      productId,
      status: dto.status,
    });

    return {
      success: true,
      message: 'Product status updated successfully',
      data,
    };
  }

  @Delete(':productId')
  async deleteProduct(
    @Param('productId') productId: string,
    @Query('force') force?: string,
  ) {
    const data = await this.orchestrator.deleteProduct({
      productId,
      force: force === 'true',
    });

    const message =
      data.outcome === 'ARCHIVED'
        ? 'Product archived successfully because historical orders exist.'
        : 'Product permanently deleted.';

    return {
      success: true,
      code:
        data.outcome === 'ARCHIVED' ? 'PRODUCT_ARCHIVED' : 'PRODUCT_DELETED',
      message,
      data,
    };
  }

  @Post(':productId/restore')
  async restoreProduct(@Param('productId') productId: string) {
    const data = await this.orchestrator.restoreProduct({ productId });

    return {
      success: true,
      code: 'PRODUCT_RESTORED',
      message: 'Product restored successfully.',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCT – TRENDING                               */
  /* ================================================= */

  @Post(':productId/trending/on')
  @Roles(ActorType.SUPER_ADMIN)
  async markTrending(@Param('productId') productId: string) {
    await this.orchestrator.markProductTrending({ productId });

    return {
      success: true,
      code: 'PRODUCT_MARKED_TRENDING',
      message: 'Product marked as trending',
      data: null,
    };
  }

  @Post(':productId/trending/off')
  @Roles(ActorType.SUPER_ADMIN)
  async unmarkTrending(@Param('productId') productId: string) {
    await this.orchestrator.unmarkProductTrending({ productId });

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
  async markFeatured(@Param('productId') productId: string) {
    await this.orchestrator.markProductFeatured({ productId });

    return {
      success: true,
      code: 'PRODUCT_MARKED_FEATURED',
      message: 'Product marked as featured',
      data: null,
    };
  }

  @Post(':productId/featured/off')
  @Roles(ActorType.SUPER_ADMIN)
  async unmarkFeatured(@Param('productId') productId: string) {
    await this.orchestrator.unmarkProductFeatured({ productId });

    return {
      success: true,
      code: 'PRODUCT_UNMARKED_FEATURED',
      message: 'Product removed from featured',
      data: null,
    };
  }
}
