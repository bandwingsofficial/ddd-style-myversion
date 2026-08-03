import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';

import { CategoryOrchestratorService } from '../services/category-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';
import { ValidationError } from '../../../common/errors';

import { CreateCategoryDto } from '../dtos/create-category.dto';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { UpdateCategoryStatusDto } from '../dtos/update-category-status.dto';
import { ReorderCategoryItemDto } from '../dtos/reorder-categories.dto';
import { ListCategoriesQueryDto } from '../dtos/list-categories-query.dto';

import { Category } from '../domain/models/category.model';
import { categoryImageUploadOptions } from '../../uploads/validators/multer-memory.options';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.SUPER_ADMIN)
export class CategoryManagementController {
  constructor(private readonly orchestrator: CategoryOrchestratorService) {}

  @Get()
  async listCategories(@Query() query: ListCategoriesQueryDto) {
    const data = await this.orchestrator.listCategories(query);

    return {
      success: true,
      message: 'Categories fetched successfully',
      data,
    };
  }

  @Patch('reorder')
  async reorderCategories(
    @Body(
      new ParseArrayPipe({
        items: ReorderCategoryItemDto,
      }),
    )
    items: ReorderCategoryItemDto[],
  ) {
    const data = await this.orchestrator.reorderCategories(items);

    return {
      success: true,
      message: 'Categories reordered successfully',
      data,
    };
  }

  @Get(':categoryId')
  async getCategoryById(@Param('categoryId') categoryId: string) {
    const data = await this.orchestrator.getCategoryById(categoryId);

    return {
      success: true,
      message: 'Category fetched successfully',
      data,
    };
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', categoryImageUploadOptions))
  async createCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateCategoryDto,
  ) {
    if (!file) {
      throw new ValidationError(
        'CATEGORY_IMAGE_REQUIRED',
        'Cover image is required',
      );
    }

    const category = Category.createNew({
      id: randomUUID(),
      name: dto.name,
      subtitle: dto.subtitle,
      sortOrder: 1,
    });

    const data = await this.orchestrator.createCategory({
      category,
      imageFile: file,
    });

    return {
      success: true,
      message: 'Category created successfully',
      data,
    };
  }

  @Patch(':categoryId')
  @UseInterceptors(FileInterceptor('image', categoryImageUploadOptions))
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateCategoryDto,
  ) {
    const data = await this.orchestrator.updateCategory({
      categoryId,
      name: dto.name,
      subtitle: dto.subtitle,
      imageFile: file,
      removeImage: dto.removeImage === 'true',
    });

    return {
      success: true,
      message: 'Category updated successfully',
      data,
    };
  }

  @Patch(':categoryId/status')
  async updateCategoryStatus(
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryStatusDto,
  ) {
    const data = await this.orchestrator.updateCategoryStatus({
      categoryId,
      status: dto.status,
    });

    return {
      success: true,
      message: 'Category status updated successfully',
      data,
    };
  }

  @Delete(':categoryId')
  async deleteCategory(@Param('categoryId') categoryId: string) {
    const data = await this.orchestrator.deleteCategory({ categoryId });

    return {
      success: true,
      message: 'Category deleted permanently',
      data,
    };
  }
}
