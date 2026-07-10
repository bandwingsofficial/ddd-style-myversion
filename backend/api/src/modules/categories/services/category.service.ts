import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { Category } from '../domain/models/category.model';
import { CategoryRepository } from '../repositories/category.repository';

import { ValidationError } from '../../../common/errors';

/* 🔥 EVENTS */
import { CategoryEventsService } from '../events/category-events.service';
import { UploadFolders } from '../../uploads/constants/upload-folders.constants';
import { UploadService } from '../../uploads/services/upload.service';
import { MulterUploadFile } from '../../uploads/interfaces/upload-file.interface';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryRepo: CategoryRepository,
    private readonly categoryEvents: CategoryEventsService,
    private readonly uploadService: UploadService,
  ) {}

  /* ================================================= */
  /* 🔒 IMAGE PATH NORMALIZATION                       */
  /* ================================================= */

  private normalizeImagePath(
    imagePath?: string | null,
  ): string | null | undefined {
    if (!imagePath) return imagePath;

    let normalized = imagePath.trim();

    normalized = normalized.replace(/^https?:\/\/[^/]+\//, '');

    if (normalized.startsWith('/')) {
      normalized = normalized.slice(1);
    }

    if (!normalized.startsWith(`${UploadFolders.CATEGORIES}/`)) {
      throw new ValidationError(
        'CATEGORY_INVALID_IMAGE_PATH',
        `Image path must be under ${UploadFolders.CATEGORIES}/`,
      );
    }

    return normalized;
  }

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

  async createCategory(params: {
    category: Category;
    imageFile?: MulterUploadFile;
  }): Promise<Category> {
    let result!: Category;

    let objectKey: string | undefined;

    if (params.imageFile) {
      const uploadResult = await this.uploadService.uploadSingleImage({
        folder: UploadFolders.CATEGORIES,
        file: params.imageFile,
      });

      objectKey = uploadResult.objectKey;
    } else if (params.category.imagePath) {
      objectKey = this.normalizeImagePath(
        params.category.imagePath,
      ) as string;
    }

    const normalizedCategory = params.category.updateDetails({
      subtitle: params.category.subtitle,
      imagePath: objectKey,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.normalizeActiveSortOrders(tx);

      const existing = await this.categoryRepo.findByName(
        normalizedCategory.name,
        tx,
      );

      if (existing && existing.isActive()) {
        throw new ValidationError(
          'CATEGORY_ALREADY_EXISTS',
          'Category with this name already exists',
        );
      }

      if (existing && existing.isInactive()) {
        await this.categoryRepo.shiftActiveSortOrdersFrom(
          normalizedCategory.sortOrder,
          tx,
        );

        const restored = existing
          .enable()
          .changeSortOrder(normalizedCategory.sortOrder)
          .updateDetails({
            subtitle: normalizedCategory.subtitle,
            imagePath: normalizedCategory.imagePath,
          });

        result = await this.categoryRepo.update(restored, tx);
        return;
      }

      await this.categoryRepo.shiftActiveSortOrdersFrom(
        normalizedCategory.sortOrder,
        tx,
      );

      result = await this.categoryRepo.create(normalizedCategory, tx);
    });

    this.categoryEvents.emitCategoryCreated({
      categoryId: result.id,
    });

    return result;
  }

  /* ================================================= */
  /* UPDATE DETAILS (IMAGE / SUBTITLE)                 */
  /* ================================================= */

  async updateCategoryDetails(params: {
    categoryId: string;
    subtitle?: string;
    imagePath?: string | null;
    imageFile?: MulterUploadFile;
    removeImage?: boolean;
  }): Promise<Category> {
    const category = await this.getById(params.categoryId);

    if (category.isInactive()) {
      throw new ValidationError(
        'CATEGORY_INACTIVE_UPDATE',
        'Cannot update an inactive category',
      );
    }

    const oldImage = category.imagePath;
    let nextImagePath: string | null | undefined = params.imagePath;

    if (params.removeImage) {
      nextImagePath = null;
    } else if (params.imageFile) {
      const uploadResult = await this.uploadService.uploadSingleImage({
        folder: UploadFolders.CATEGORIES,
        file: params.imageFile,
      });

      nextImagePath = uploadResult.objectKey;
    }

    const updated = category.updateDetails({
      subtitle: params.subtitle,
      imagePath:
        nextImagePath === undefined
          ? undefined
          : this.normalizeImagePath(nextImagePath),
    });

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.update(updated, tx);
    });

    if (oldImage && oldImage !== updated.imagePath) {
      await this.deleteImageSafe(oldImage);

      if (updated.imagePath) {
        this.categoryEvents.emitCategoryImageUpdated({
          categoryId: updated.id,
          imagePath: updated.imagePath,
        });
      } else {
        this.categoryEvents.emitCategoryImageRemoved({
          categoryId: updated.id,
        });
      }
    }

    this.categoryEvents.emitCategoryUpdated({
      categoryId: updated.id,
    });

    return updated;
  }

  /* ================================================= */
  /* RENAME                                           */
  /* ================================================= */

  async renameCategory(params: {
    categoryId: string;
    name: string;
  }): Promise<Category> {
    const category = await this.getById(params.categoryId);

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
/* ENABLE / DISABLE                                  */
/* ================================================= */

async disableCategory(categoryId: string): Promise<{
  id: string;
  status: 'INACTIVE';
}> {
  const category = await this.getById(categoryId);

  if (category.isInactive()) {
    return {
      id: category.id,
      status: 'INACTIVE',
    };
  }

  const disabled = category.disable();

  await this.prisma.$transaction(async (tx) => {
    await this.categoryRepo.updateStatus(disabled, tx);

    await this.categoryRepo.normalizeActiveSortOrders(tx);
  });

  this.categoryEvents.emitCategoryDisabled({
    categoryId: category.id,
  });

  return {
    id: category.id,
    status: 'INACTIVE',
  };
}

async enableCategory(categoryId: string): Promise<{
  id: string;
  status: 'ACTIVE';
}> {
  const category = await this.getById(categoryId);

  if (category.isActive()) {
    return {
      id: category.id,
      status: 'ACTIVE',
    };
  }

  const enabled = category.enable();

  await this.prisma.$transaction(async (tx) => {
    await this.categoryRepo.updateStatus(enabled, tx);

    await this.categoryRepo.normalizeActiveSortOrders(tx);
  });

  this.categoryEvents.emitCategoryEnabled({
    categoryId: category.id,
  });

  return {
    id: category.id,
    status: 'ACTIVE',
  };
}

  /* ================================================= */
  /* SORT ORDER                                       */
  /* ================================================= */

  async changeSortOrder(params: {
    categoryId: string;
    sortOrder: number;
  }): Promise<Category> {
    const category = await this.getById(params.categoryId);

    if (category.isInactive()) {
      throw new ValidationError(
        'CATEGORY_INACTIVE_SORT_ORDER_CHANGE',
        'Cannot change sort order of an inactive category',
      );
    }

    let updated!: Category;

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.normalizeActiveSortOrders(tx);
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

  /* ================================================= */
  /* STORAGE HELPERS                                  */
  /* ================================================= */

  private async deleteImageSafe(objectKey?: string): Promise<void> {
    if (!objectKey) return;

    try {
      await this.uploadService.deleteObject({ objectKey });
    } catch {
      // silent fail (object may not exist)
    }
  }
}
