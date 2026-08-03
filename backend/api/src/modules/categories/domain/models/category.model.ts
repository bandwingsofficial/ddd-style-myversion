// src/modules/categories/domain/models/category.model.ts

import { ValidationError } from '../../../../common/errors';
import { CategoryStatus } from '../enums/category-status.enum';

export interface CategoryProps {
  id: string;
  name: string;
  subtitle?: string;
  imagePath?: string;
  status: CategoryStatus;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  readonly id: string;
  readonly name: string;
  readonly subtitle?: string;
  readonly imagePath?: string;
  readonly status: CategoryStatus;
  readonly sortOrder: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private static readonly MIN_NAME_LENGTH = 2;
  private static readonly MAX_NAME_LENGTH = 100;
  private static readonly MAX_SUBTITLE_LENGTH = 150;

  private constructor(props: CategoryProps) {
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  static createNew(params: {
    id: string;
    name: string;
    subtitle?: string;
    imagePath?: string;
    sortOrder: number;
    now?: Date;
  }): Category {
    const now = params.now ?? new Date();

    return new Category({
      id: params.id,
      name: Category.validateNameInput(params.name),
      subtitle: Category.normalizeSubtitle(params.subtitle),
      imagePath: params.imagePath,
      status: CategoryStatus.ACTIVE,
      sortOrder: params.sortOrder,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: CategoryProps): Category {
    return new Category({
      ...props,
      name: props.name.trim(),
      subtitle: Category.normalizeSubtitle(props.subtitle),
    });
  }

  isActive(): boolean {
    return this.status === CategoryStatus.ACTIVE;
  }

  isInactive(): boolean {
    return this.status === CategoryStatus.INACTIVE;
  }

  canParticipateInOrdering(): boolean {
    return this.isActive();
  }

  update(
    params: {
      name?: string;
      subtitle?: string;
      imagePath?: string | null;
    },
    now = new Date(),
  ): Category {
    if (this.isInactive()) {
      throw new ValidationError(
        'CATEGORY_INACTIVE_UPDATE',
        'Cannot edit inactive category. Activate category first.',
      );
    }

    return new Category({
      ...this,
      name:
        params.name !== undefined
          ? Category.validateNameInput(params.name)
          : this.name,
      subtitle:
        params.subtitle !== undefined
          ? Category.normalizeSubtitle(params.subtitle)
          : this.subtitle,
      imagePath:
        params.imagePath === null
          ? undefined
          : (params.imagePath ?? this.imagePath),
      updatedAt: now,
    });
  }

  changeStatus(status: CategoryStatus, now = new Date()): Category {
    if (this.status === status) {
      return this;
    }

    return new Category({
      ...this,
      status,
      updatedAt: now,
    });
  }

  private assertValidState(): void {
    Category.assertName(this.name);

    if (
      this.subtitle !== undefined &&
      this.subtitle.length > Category.MAX_SUBTITLE_LENGTH
    ) {
      throw new ValidationError(
        'CATEGORY_INVALID_SUBTITLE',
        `Subtitle must be at most ${Category.MAX_SUBTITLE_LENGTH} characters`,
      );
    }

    if (this.imagePath && !this.imagePath.startsWith('categories/')) {
      throw new ValidationError(
        'CATEGORY_INVALID_IMAGE_PATH',
        'Image path must start with categories/',
      );
    }

    if (this.sortOrder < 0) {
      throw new ValidationError(
        'CATEGORY_INVALID_SORT_ORDER',
        'Sort order cannot be negative',
      );
    }
  }

  static assertName(name: string): void {
    if (!name || name.length < Category.MIN_NAME_LENGTH) {
      throw new ValidationError(
        'CATEGORY_INVALID_NAME',
        'Category name must be at least 2 characters.',
      );
    }

    if (name.length > Category.MAX_NAME_LENGTH) {
      throw new ValidationError(
        'CATEGORY_INVALID_NAME',
        'Category name must be at most 100 characters.',
      );
    }
  }

  static validateNameInput(raw: string): string {
    const trimmed = raw.trim();

    if (!trimmed) {
      throw new ValidationError(
        'CATEGORY_NAME_REQUIRED',
        'Category name is required.',
      );
    }

    if (raw !== trimmed) {
      throw new ValidationError(
        'CATEGORY_NAME_WHITESPACE',
        'Category name cannot have leading or trailing spaces.',
      );
    }

    if (trimmed.length < Category.MIN_NAME_LENGTH) {
      throw new ValidationError(
        'CATEGORY_INVALID_NAME',
        'Category name must be at least 2 characters.',
      );
    }

    if (trimmed.length > Category.MAX_NAME_LENGTH) {
      throw new ValidationError(
        'CATEGORY_INVALID_NAME',
        'Category name must be at most 100 characters.',
      );
    }

    return trimmed;
  }

  private static normalizeSubtitle(subtitle?: string): string | undefined {
    const trimmed = subtitle?.trim();
    return trimmed ? trimmed : undefined;
  }
}
