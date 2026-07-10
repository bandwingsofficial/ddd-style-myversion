// src/modules/categories/services/category-orchestrator.service.ts

import { Injectable } from '@nestjs/common';

import { CategoryService } from './category.service';
import { Category } from '../domain/models/category.model';
import {
  CategoryPublicResponse,
  CategoryResponse,
  CategoryResponseMapper,
} from '../mappers/category-response.mapper';
import { MulterUploadFile } from '../../uploads/interfaces/upload-file.interface';

@Injectable()
export class CategoryOrchestratorService {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categoryResponseMapper: CategoryResponseMapper,
  ) {}

  /* ================================================= */
  /* CATEGORY – READS                                 */
  /* ================================================= */

  async getCategoryById(
    categoryId: string,
  ): Promise<CategoryResponse> {
    const category = await this.categoryService.getById(categoryId);

    return this.categoryResponseMapper.toResponse(category);
  }

  async getAllCategories(params?: {
    includeInactive?: boolean;
  }): Promise<CategoryResponse[]> {
    const categories = await this.categoryService.getAll(params);

    return this.categoryResponseMapper.toResponseList(categories);
  }

  async getAllCategoriesForPublic(): Promise<CategoryPublicResponse[]> {
    const categories = await this.categoryService.getAll({
      includeInactive: false,
    });

    return this.categoryResponseMapper.toPublicResponseList(
      categories,
    );
  }

  /* ================================================= */
  /* CATEGORY – CREATE / UPDATE                       */
  /* ================================================= */

  async createCategory(params: {
    category: Category;
    imageFile?: MulterUploadFile;
  }): Promise<CategoryResponse> {
    const category = await this.categoryService.createCategory(
      params,
    );

    return this.categoryResponseMapper.toResponse(category);
  }

  async renameCategory(params: {
    categoryId: string;
    name: string;
  }): Promise<CategoryResponse> {
    const category = await this.categoryService.renameCategory(
      params,
    );

    return this.categoryResponseMapper.toResponse(category);
  }

  async updateCategoryDetails(params: {
    categoryId: string;
    subtitle?: string;
    imagePath?: string | null;
    imageFile?: MulterUploadFile;
    removeImage?: boolean;
  }): Promise<CategoryResponse> {
    const category =
      await this.categoryService.updateCategoryDetails(params);

    return this.categoryResponseMapper.toResponse(category);
  }

  async disableCategory(params: {
    categoryId: string;
  }): Promise<{ id: string; status: 'INACTIVE' }> {
    return this.categoryService.disableCategory(
      params.categoryId,
    );
  }

  async enableCategory(params: {
    categoryId: string;
  }): Promise<{ id: string; status: 'ACTIVE' }> {
    return this.categoryService.enableCategory(
      params.categoryId,
    );
  }

  /* ================================================= */
  /* CATEGORY – SORT ORDER                             */
  /* ================================================= */

  async changeCategorySortOrder(params: {
    categoryId: string;
    sortOrder: number;
  }): Promise<CategoryResponse> {
    const category = await this.categoryService.changeSortOrder(
      params,
    );

    return this.categoryResponseMapper.toResponse(category);
  }
}
