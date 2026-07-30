import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { Category } from '../domain/models/category.model';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryStatus } from '../domain/enums/category-status.enum';

import { ValidationError } from '../../../common/errors';

import { CategoryEventsService } from '../events/category-events.service';
import { UploadFolders } from '../../uploads/constants/upload-folders.constants';
import { UploadService } from '../../uploads/services/upload.service';
import { MulterUploadFile } from '../../uploads/interfaces/upload-file.interface';
import { ListCategoriesQueryDto } from '../dtos/list-categories-query.dto';

const CATEGORY_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
] as const;

const CATEGORY_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.svg',
] as const;

const CATEGORY_MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryRepo: CategoryRepository,
    private readonly categoryEvents: CategoryEventsService,
    private readonly uploadService: UploadService,
  ) {}

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
    return this.categoryRepo.findAll(params?.includeInactive ?? false);
  }

  async listCategories(query: ListCategoriesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const result = await this.categoryRepo.findPaginated({
      page,
      limit,
      search: query.search,
    });

    return {
      items: result.items,
      page,
      limit,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / limit)),
    };
  }

  async createCategory(params: {
    category: Category;
    imageFile: MulterUploadFile;
  }): Promise<Category> {
    if (!params.imageFile) {
      throw new ValidationError(
        'CATEGORY_IMAGE_REQUIRED',
        'Cover image is required',
      );
    }

    const normalizedName = Category.validateNameInput(params.category.name);

    const existing = await this.categoryRepo.findByName(normalizedName);

    if (existing) {
      throw new ValidationError(
        'CATEGORY_ALREADY_EXISTS',
        'Category already exists',
      );
    }

    const uploadResult = await this.uploadService.uploadSingleImage({
      folder: UploadFolders.CATEGORIES,
      file: params.imageFile,
      allowedMimeTypes: [...CATEGORY_IMAGE_MIME_TYPES],
      allowedExtensions: [...CATEGORY_IMAGE_EXTENSIONS],
      maxSizeBytes: CATEGORY_MAX_IMAGE_SIZE_BYTES,
    });

    let created!: Category;

    try {
      await this.prisma.$transaction(async (tx) => {
        const nextSortOrder =
          await this.categoryRepo.getNextActiveSortOrder(tx);

        const category = Category.createNew({
          id: params.category.id,
          name: params.category.name,
          subtitle: params.category.subtitle,
          imagePath: uploadResult.objectKey,
          sortOrder: nextSortOrder,
        });

        created = await this.categoryRepo.create(category, tx);
      });
    } catch (error) {
      await this.deleteImageStrict(uploadResult.objectKey);
      throw error;
    }

    this.categoryEvents.emitCategoryCreated({
      categoryId: created.id,
    });

    return created;
  }

  async updateCategory(params: {
    categoryId: string;
    name?: string;
    subtitle?: string;
    imageFile?: MulterUploadFile;
    removeImage?: boolean;
  }): Promise<Category> {
    const category = await this.getById(params.categoryId);

    if (category.isInactive()) {
      throw new ValidationError(
        'CATEGORY_INACTIVE_UPDATE',
        'Cannot edit inactive category. Activate category first.',
      );
    }

    let normalizedName: string | undefined;

    if (params.name !== undefined) {
      normalizedName = Category.validateNameInput(params.name);

      const duplicate = await this.categoryRepo.findByName(
        normalizedName,
        undefined,
        category.id,
      );

      if (duplicate) {
        throw new ValidationError(
          'CATEGORY_ALREADY_EXISTS',
          'Category already exists',
        );
      }
    }

    const oldImage = category.imagePath;
    let uploadedObjectKey: string | undefined;

    if (params.imageFile) {
      const uploadResult = await this.uploadService.uploadSingleImage({
        folder: UploadFolders.CATEGORIES,
        file: params.imageFile,
        allowedMimeTypes: [...CATEGORY_IMAGE_MIME_TYPES],
        allowedExtensions: [...CATEGORY_IMAGE_EXTENSIONS],
        maxSizeBytes: CATEGORY_MAX_IMAGE_SIZE_BYTES,
      });

      uploadedObjectKey = uploadResult.objectKey;
    }

    let nextImagePath: string | null | undefined = undefined;

    if (params.removeImage) {
      nextImagePath = null;
    } else if (uploadedObjectKey) {
      nextImagePath = uploadedObjectKey;
    }

    const updated = category.update({
      name: normalizedName,
      subtitle: params.subtitle,
      imagePath: nextImagePath,
    });

    try {
      await this.prisma.$transaction(async (tx) => {
        await this.categoryRepo.update(updated, tx);

        if (oldImage && oldImage !== updated.imagePath) {
          await this.deleteImageStrict(oldImage);
        }
      });
    } catch (error) {
      if (uploadedObjectKey) {
        await this.deleteImageStrict(uploadedObjectKey);
      }

      throw error;
    }

    if (oldImage !== updated.imagePath) {
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
      name: updated.name,
    });

    return updated;
  }

  async updateCategoryStatus(params: {
    categoryId: string;
    status: CategoryStatus;
  }): Promise<Category> {
    const category = await this.getById(params.categoryId);
    const updated = category.changeStatus(params.status);

    if (updated.status === category.status) {
      return category;
    }

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.updateStatusOnly(updated, tx);
    });

    if (updated.isActive()) {
      this.categoryEvents.emitCategoryEnabled({
        categoryId: updated.id,
      });
    } else {
      this.categoryEvents.emitCategoryDisabled({
        categoryId: updated.id,
      });
    }

    return updated;
  }

  async reorderCategories(
    items: { id: string; sortOrder: number }[],
  ): Promise<Category[]> {
    const activeCategories =
      await this.categoryRepo.findActiveCategories();

    if (items.length !== activeCategories.length) {
      throw new ValidationError(
        'CATEGORY_REORDER_INVALID',
        'Reorder payload must include all active categories',
      );
    }

    const activeIds = new Set(activeCategories.map((c) => c.id));
    const payloadIds = items.map((item) => item.id);
    const payloadSortOrders = items.map((item) => item.sortOrder);

    if (new Set(payloadIds).size !== payloadIds.length) {
      throw new ValidationError(
        'CATEGORY_REORDER_DUPLICATE_IDS',
        'Duplicate category ids in reorder payload',
      );
    }

    if (new Set(payloadSortOrders).size !== payloadSortOrders.length) {
      throw new ValidationError(
        'CATEGORY_REORDER_DUPLICATE_SORT',
        'Duplicate sort order values in reorder payload',
      );
    }

    for (const item of items) {
      if (!activeIds.has(item.id)) {
        throw new ValidationError(
          'CATEGORY_REORDER_INVALID_ID',
          'Reorder payload contains invalid category id',
        );
      }

      if (item.sortOrder < 1 || item.sortOrder > items.length) {
        throw new ValidationError(
          'CATEGORY_REORDER_INVALID_SORT',
          'Reorder sort order values must be consecutive starting from 1',
        );
      }
    }

    const expectedSortOrders = Array.from(
      { length: items.length },
      (_, index) => index + 1,
    ).sort((a, b) => a - b);

    const sortedPayloadSortOrders = [...payloadSortOrders].sort(
      (a, b) => a - b,
    );

    if (
      sortedPayloadSortOrders.some(
        (value, index) => value !== expectedSortOrders[index],
      )
    ) {
      throw new ValidationError(
        'CATEGORY_REORDER_MISSING_SORT',
        'Reorder payload has missing sort order values',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.updateSortOrders(items, tx);
      await this.categoryRepo.normalizeActiveSortOrders(tx);
    });

    const reordered = await this.categoryRepo.findActiveCategories();

    this.categoryEvents.emitCategorySortOrderChanged({
      categoryId: reordered[0]?.id ?? items[0].id,
      sortOrder: reordered[0]?.sortOrder ?? 1,
    });

    return reordered;
  }

  async deleteCategory(categoryId: string): Promise<{ id: string }> {
    const category = await this.getById(categoryId);

    const productCount =
      await this.categoryRepo.countProductsByCategoryId(categoryId);

    if (productCount > 0) {
      throw new ValidationError(
        'CATEGORY_HAS_PRODUCTS',
        'Cannot delete category while products are assigned to it',
      );
    }

    const imagePath = category.imagePath;

    await this.prisma.$transaction(async (tx) => {
      await this.categoryRepo.deleteById(categoryId, tx);

      if (imagePath) {
        await this.deleteImageStrict(imagePath);
      }

      if (category.isActive()) {
        await this.categoryRepo.normalizeActiveSortOrders(tx);
      }
    });

    this.categoryEvents.emitCategoryDisabled({
      categoryId: category.id,
    });

    return { id: category.id };
  }

  private async deleteImageStrict(objectKey: string): Promise<void> {
    await this.uploadService.deleteObject({ objectKey });
  }
}
