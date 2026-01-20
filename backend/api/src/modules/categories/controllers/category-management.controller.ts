// src/modules/categories/controllers/category-management.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';

import { CategoryOrchestratorService } from '../services/category-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

/* DTOs */
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { RenameCategoryDto } from '../dtos/rename-category.dto';
import { ChangeCategorySortOrderDto } from '../dtos/change-category-sort-order.dto';
import { UpdateCategoryDetailsDto } from '../dtos/update-category-details.dto';

/* Domain */
import { Category } from '../domain/models/category.model';

/* Upload */
import { categoryImageUploadOptions } from '../../../common/upload/category-image.upload';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.SUPER_ADMIN)
export class CategoryManagementController {
  constructor(
    private readonly orchestrator: CategoryOrchestratorService,
  ) {}

  /* ================================================= */
  /* CATEGORY – READS (ADMIN)                          */
  /* ================================================= */

  @Get()
  async getAllCategoriesForAdmin() {
    const data =
      await this.orchestrator.getAllCategories({
        includeInactive: true,
      });

    return {
      success: true,
      code: 'CATEGORIES_FETCHED_ADMIN',
      message: 'All categories fetched successfully',
      data,
    };
  }

  @Get(':categoryId')
  async getCategoryById(
    @Param('categoryId') categoryId: string,
  ) {
    const data =
      await this.orchestrator.getCategoryById(categoryId);

    return {
      success: true,
      code: 'CATEGORY_FETCHED',
      message: 'Category fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* CATEGORY – CREATE (WITH IMAGE)                    */
  /* ================================================= */

  @Post()
  @UseInterceptors(
    FileInterceptor('image', categoryImageUploadOptions),
  )
  async createCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user,
  ) {
    const category = Category.createNew({
      id: randomUUID(),
      name: dto.name,
      subtitle: dto.subtitle,
      imagePath: file
        ? `images/categories/${file.filename}`
        : undefined,
      sortOrder: dto.sortOrder,
    });

    const data =
      await this.orchestrator.createCategory({
        category,
      });

    return {
      success: true,
      code: 'CATEGORY_CREATED',
      message: 'Category created successfully',
      data,
    };
  }

  /* ================================================= */
  /* CATEGORY – UPDATE DETAILS                         */
  /* ================================================= */

  @Post(':categoryId/details')
  @UseInterceptors(
    FileInterceptor('image', categoryImageUploadOptions),
  )
  async updateCategoryDetails(
    @Param('categoryId') categoryId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateCategoryDetailsDto,
  ) {
    const imagePath =
      dto.removeImage === 'true'
        ? null
        : file
        ? `images/categories/${file.filename}`
        : undefined;

    const data =
      await this.orchestrator.updateCategoryDetails({
        categoryId,
        subtitle: dto.subtitle,
        imagePath,
      });

    return {
      success: true,
      code: 'CATEGORY_UPDATED',
      message: 'Category updated successfully',
      data,
    };
  }

  /* ================================================= */
  /* CATEGORY – UPDATE (EXISTING ROUTES)               */
  /* ================================================= */

  @Post(':categoryId/rename')
  async renameCategory(
    @Param('categoryId') categoryId: string,
    @Body() dto: RenameCategoryDto,
  ) {
    const data =
      await this.orchestrator.renameCategory({
        categoryId,
        name: dto.name,
      });

    return {
      success: true,
      code: 'CATEGORY_UPDATED',
      message: 'Category renamed successfully',
      data,
    };
  }

  @Post(':categoryId/disable')
  async disableCategory(
    @Param('categoryId') categoryId: string,
  ) {
    const data =
      await this.orchestrator.disableCategory({
        categoryId,
      });

    return {
      success: true,
      code: 'CATEGORY_DISABLED',
      message: 'Category disabled successfully',
      data,
    };
  }

  @Post(':categoryId/enable')
  async enableCategory(
    @Param('categoryId') categoryId: string,
  ) {
    const data =
      await this.orchestrator.enableCategory({
        categoryId,
      });

    return {
      success: true,
      code: 'CATEGORY_ENABLED',
      message: 'Category enabled successfully',
      data,
    };
  }

  @Post(':categoryId/sort-order')
  async changeSortOrder(
    @Param('categoryId') categoryId: string,
    @Body() dto: ChangeCategorySortOrderDto,
  ) {
    const data =
      await this.orchestrator.changeCategorySortOrder({
        categoryId,
        sortOrder: dto.sortOrder,
      });

    return {
      success: true,
      code: 'CATEGORY_SORT_ORDER_UPDATED',
      message: 'Category sort order updated successfully',
      data,
    };
  }
}
