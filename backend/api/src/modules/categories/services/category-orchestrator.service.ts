import { Injectable } from '@nestjs/common';

import { CategoryService } from './category.service';
import { Category } from '../domain/models/category.model';
import {
  CategoryPublicResponse,
  CategoryResponse,
  CategoryResponseMapper,
} from '../mappers/category-response.mapper';
import { MulterUploadFile } from '../../uploads/interfaces/upload-file.interface';
import { ListCategoriesQueryDto } from '../dtos/list-categories-query.dto';
import { CategoryStatus } from '../domain/enums/category-status.enum';

export interface PaginatedCategoryResponse {
  items: CategoryResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

@Injectable()
export class CategoryOrchestratorService {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categoryResponseMapper: CategoryResponseMapper,
  ) {}

  async getCategoryById(categoryId: string): Promise<CategoryResponse> {
    const category = await this.categoryService.getById(categoryId);

    return this.categoryResponseMapper.toResponse(category);
  }

  async listCategories(
    query: ListCategoriesQueryDto,
  ): Promise<PaginatedCategoryResponse> {
    const result = await this.categoryService.listCategories(query);

    return {
      items: await this.categoryResponseMapper.toResponseList(
        result.items,
      ),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  }

  async getAllCategoriesForPublic(): Promise<CategoryPublicResponse[]> {
    const categories = await this.categoryService.getAll({
      includeInactive: false,
    });

    return this.categoryResponseMapper.toPublicResponseList(categories);
  }

  async createCategory(params: {
    category: Category;
    imageFile: MulterUploadFile;
  }): Promise<CategoryResponse> {
    const category = await this.categoryService.createCategory(params);

    return this.categoryResponseMapper.toResponse(category);
  }

  async updateCategory(params: {
    categoryId: string;
    name?: string;
    subtitle?: string;
    imageFile?: MulterUploadFile;
    removeImage?: boolean;
  }): Promise<CategoryResponse> {
    const category = await this.categoryService.updateCategory(params);

    return this.categoryResponseMapper.toResponse(category);
  }

  async updateCategoryStatus(params: {
    categoryId: string;
    status: CategoryStatus;
  }): Promise<CategoryResponse> {
    const category = await this.categoryService.updateCategoryStatus(
      params,
    );

    return this.categoryResponseMapper.toResponse(category);
  }

  async reorderCategories(
    items: { id: string; sortOrder: number }[],
  ): Promise<CategoryResponse[]> {
    const categories =
      await this.categoryService.reorderCategories(items);

    return this.categoryResponseMapper.toResponseList(categories);
  }

  async deleteCategory(params: {
    categoryId: string;
  }): Promise<{ id: string }> {
    return this.categoryService.deleteCategory(params.categoryId);
  }
}
