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

  async getAll(params?: {
    includeInactive?: boolean;
  }): Promise<Category[]> {
    return this.categoryRepo.findAll(
      params?.includeInactive ?? false,
    );
  }

  /* ================================================= */
  /* CREATE CATEGORY                                   */
  /* ================================================= */

  async createCategory(category: Category): Promise<Category> {
    let result!: Category;

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.normalizeActiveSortOrders(tx);

      const existing = await this.categoryRepo.findByName(
        category.name,
        tx,
      );

      /* ACTIVE duplicate → reject */
      if (existing && existing.isActive()) {
        throw new ValidationError(
          'CATEGORY_ALREADY_EXISTS',
          'Category with this name already exists',
        );
      }

      /* INACTIVE duplicate → restore */
      if (existing && existing.isInactive()) {
        await this.categoryRepo.shiftActiveSortOrdersFrom(
          category.sortOrder,
          tx,
        );

        const restored = existing
          .enable() // ✅ becomes ACTIVE
          .changeSortOrder(category.sortOrder); // ✅ allowed now

        result = await this.categoryRepo.update(
          restored,
          tx,
        );
        return;
      }

      /* New category */
      await this.categoryRepo.shiftActiveSortOrdersFrom(
        category.sortOrder,
        tx,
      );

      result = await this.categoryRepo.create(
        category,
        tx,
      );
    });

    this.categoryEvents.emitCategoryCreated({
      categoryId: result.id,
    });

    return result;
  }

  /* ================================================= */
  /* RENAME                                           */
  /* ================================================= */

  async renameCategory(params: {
    categoryId: string;
    name: string;
  }): Promise<Category> {
    const category = await this.getById(
      params.categoryId,
    );

    /* 🔒 HARD BLOCK */
    if (category.isInactive()) {
      throw new ValidationError(
        'CATEGORY_INACTIVE_RENAME',
        'Cannot rename an inactive category',
      );
    }

    const updated = category.rename(params.name);

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.update(updated, tx);
    });

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
    const category = await this.getById(categoryId);

    if (category.isInactive()) {
      return { id: category.id, status: 'INACTIVE' };
    }

    const disabled = category.disable();

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.updateStatus(disabled, tx);
      await this.categoryRepo.normalizeActiveSortOrders(tx);
    });

    this.categoryEvents.emitCategoryDisabled({
      categoryId: category.id,
    });

    return { id: category.id, status: 'INACTIVE' };
  }

  async enableCategory(categoryId: string): Promise<{
    id: string;
    status: 'ACTIVE';
  }> {
    const category = await this.getById(categoryId);

    if (category.isActive()) {
      return { id: category.id, status: 'ACTIVE' };
    }

    const enabled = category.enable();

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.updateStatus(enabled, tx);
      await this.categoryRepo.normalizeActiveSortOrders(tx);
    });

    this.categoryEvents.emitCategoryEnabled({
      categoryId: category.id,
    });

    return { id: category.id, status: 'ACTIVE' };
  }

  /* ================================================= */
  /* SORT ORDER (MANUAL REORDER)                       */
  /* ================================================= */

  async changeSortOrder(params: {
    categoryId: string;
    sortOrder: number;
  }): Promise<Category> {
    const category = await this.getById(
      params.categoryId,
    );

    /* 🔒 HARD BLOCK */
    if (category.isInactive()) {
      throw new ValidationError(
        'CATEGORY_INACTIVE_SORT_ORDER_CHANGE',
        'Cannot change sort order of an inactive category',
      );
    }

    let updated!: Category;

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.normalizeActiveSortOrders(
        tx,
      );

      await this.categoryRepo.shiftActiveSortOrdersFrom(
        params.sortOrder,
        tx,
      );

      updated = category.changeSortOrder(
        params.sortOrder,
      );

      await this.categoryRepo.update(updated, tx);
    });

    this.categoryEvents.emitCategorySortOrderChanged({
      categoryId: updated.id,
      sortOrder: params.sortOrder,
    });

    return updated;
  }
}
