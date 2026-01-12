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

  async getCategoryById(categoryId: string) {
    return this.categoryService.getById(categoryId);
  }

  /**
   * ✅ GET ALL
   * - admin → includeInactive = true
   * - customer → includeInactive = false
   */
  async getAllCategories(params?: {
    includeInactive?: boolean;
  }) {
    return this.categoryService.getAll(params);
  }

  /* ================================================= */
  /* CATEGORY – CREATE / UPDATE                       */
  /* ================================================= */

  async createCategory(params: {
    category: Category;
  }) {
    return this.categoryService.createCategory(
      params.category,
    );
  }

  async renameCategory(params: {
    categoryId: string;
    name: string;
  }) {
    return this.categoryService.renameCategory(params);
  }

  async disableCategory(params: {
    categoryId: string;
  }) {
    return this.categoryService.disableCategory(
      params.categoryId,
    );
  }

  async enableCategory(params: {
    categoryId: string;
  }) {
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
  }) {
    return this.categoryService.changeSortOrder(
      params,
    );
  }
}
