// src/modules/categories/services/category.service.ts

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { Category } from '../domain/models/category.model';
import { CategoryRepository } from '../repositories/category.repository';

import { ValidationError } from '../../../common/errors';

/* 🔥 EVENTS */
import { CategoryEventsService } from '../events/category-events.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryRepo: CategoryRepository,
    private readonly categoryEvents: CategoryEventsService,
  ) {}

  /* ================================================= */
  /* READS                                            */
  /* ================================================= */

  async getById(categoryId: string): Promise<Category> {
    const category = await this.categoryRepo.findById(categoryId);

    if (!category) {
      throw new ValidationError(
        'CATEGORY_NOT_FOUND',
        'Category not found',
      );
    }

    return category;
  }

  /**
   * ✅ GET ALL
   * - admin → includeInactive = true
   * - customer → includeInactive = false
   */
  async getAll(params?: {
    includeInactive?: boolean;
  }): Promise<Category[]> {
    return this.categoryRepo.findAll(
      params?.includeInactive ?? false,
    );
  }

  /* ================================================= */
  /* CREATE CATEGORY                                  */
  /* ================================================= */

  async createCategory(category: Category): Promise<Category> {
    let created!: Category;

    await this.prisma.$transaction(async (tx) => {
      created = await this.categoryRepo.create(category, tx);
    });

    /* 🔥 EVENTS AFTER DB SUCCESS */
    this.categoryEvents.emitCategoryCreated({
      categoryId: created.id,
    });

    return created;
  }

  /* ================================================= */
  /* UPDATE (RENAME)                                  */
  /* ================================================= */

  async renameCategory(params: {
    categoryId: string;
    name: string;
  }): Promise<Category> {
    const category = await this.categoryRepo.findById(
      params.categoryId,
    );

    if (!category) {
      throw new ValidationError(
        'CATEGORY_NOT_FOUND',
        'Category not found',
      );
    }

    const updated = category.rename(params.name);

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.update(updated, tx);
    });

    /* 🔥 EVENTS */
    this.categoryEvents.emitCategoryUpdated({
      categoryId: updated.id,
      name: updated.name,
    });

    return updated;
  }

  /* ================================================= */
  /* ENABLE / DISABLE                                 */
  /* ================================================= */

  async disableCategory(categoryId: string): Promise<{
    id: string;
    status: 'INACTIVE';
  }> {
    const category = await this.categoryRepo.findById(
      categoryId,
    );

    if (!category) {
      throw new ValidationError(
        'CATEGORY_NOT_FOUND',
        'Category not found',
      );
    }

    if (!category.isActive()) {
      return { id: category.id, status: 'INACTIVE' };
    }

    const disabled = category.disable();

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.updateStatus(disabled, tx);
    });

    /* 🔥 EVENTS */
    this.categoryEvents.emitCategoryDisabled({
      categoryId: category.id,
    });

    return { id: category.id, status: 'INACTIVE' };
  }

  async enableCategory(categoryId: string): Promise<{
    id: string;
    status: 'ACTIVE';
  }> {
    const category = await this.categoryRepo.findById(
      categoryId,
    );

    if (!category) {
      throw new ValidationError(
        'CATEGORY_NOT_FOUND',
        'Category not found',
      );
    }

    if (category.isActive()) {
      return { id: category.id, status: 'ACTIVE' };
    }

    const enabled = category.enable();

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.updateStatus(enabled, tx);
    });

    /* 🔥 EVENTS */
    this.categoryEvents.emitCategoryEnabled({
      categoryId: category.id,
    });

    return { id: category.id, status: 'ACTIVE' };
  }

  /* ================================================= */
  /* SORT ORDER                                       */
  /* ================================================= */

  async changeSortOrder(params: {
    categoryId: string;
    sortOrder: number;
  }): Promise<Category> {
    const category = await this.categoryRepo.findById(
      params.categoryId,
    );

    if (!category) {
      throw new ValidationError(
        'CATEGORY_NOT_FOUND',
        'Category not found',
      );
    }

    const updated = category.changeSortOrder(
      params.sortOrder,
    );

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.updateSortOrder(updated, tx);
    });

    /* 🔥 EVENTS */
    this.categoryEvents.emitCategorySortOrderChanged({
      categoryId: category.id,
      sortOrder: params.sortOrder,
    });

    return updated;
  }
}
