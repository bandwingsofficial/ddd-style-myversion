// src/modules/categories/services/category-orchestrator.service.ts

import { Injectable } from '@nestjs/common';

import { CategoryService } from './category.service';
import { Category } from '../domain/models/category.model';

@Injectable()
export class CategoryOrchestratorService {
  constructor(
    private readonly categoryService: CategoryService,
  ) {}

  /* ================================================= */
  /* CATEGORY – READS                                 */
  /* ================================================= */

  async getCategoryById(
    categoryId: string,
  ): Promise<Category> {
    return this.categoryService.getById(categoryId);
  }

  /**
   * GET ALL
   * - admin → includeInactive = true
   * - customer → includeInactive = false
   */
  async getAllCategories(params?: {
    includeInactive?: boolean;
  }): Promise<Category[]> {
    return this.categoryService.getAll(params);
  }

  /* ================================================= */
  /* CATEGORY – CREATE / UPDATE                       */
  /* ================================================= */

  async createCategory(params: {
    category: Category;
  }): Promise<Category> {
    return this.categoryService.createCategory(
      params.category,
    );
  }

  async renameCategory(params: {
    categoryId: string;
    name: string;
  }): Promise<Category> {
    return this.categoryService.renameCategory(
      params,
    );
  }

  /**
   * UPDATE DETAILS
   * - subtitle
   * - image (replace / remove)
   */
  async updateCategoryDetails(params: {
    categoryId: string;
    subtitle?: string;
    imagePath?: string | null;
  }): Promise<Category> {
    return this.categoryService.updateCategoryDetails(
      params,
    );
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
  }): Promise<Category> {
    return this.categoryService.changeSortOrder(
      params,
    );
  }
}
