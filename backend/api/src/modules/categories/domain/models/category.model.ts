// src/modules/categories/domain/models/category.model.ts

import { ValidationError } from '../../../../common/errors';
import { CategoryStatus } from '../enums/category-status.enum';

export interface CategoryProps {
  id: string;
  name: string;
  status: CategoryStatus;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  readonly id: string;
  readonly name: string;
  readonly status: CategoryStatus;
  readonly sortOrder: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: CategoryProps) {
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                     */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    name: string;
    sortOrder?: number;
    now?: Date;
  }): Category {
    const now = params.now ?? new Date();

    return new Category({
      id: params.id,
      name: Category.normalizeName(params.name),
      status: CategoryStatus.ACTIVE,
      sortOrder: params.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: CategoryProps): Category {
    return new Category({
      ...props,
      name: Category.normalizeName(props.name),
    });
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isActive(): boolean {
    return this.status === CategoryStatus.ACTIVE;
  }

  isInactive(): boolean {
    return this.status === CategoryStatus.INACTIVE;
  }

  canParticipateInOrdering(): boolean {
    return this.isActive();
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  rename(name: string, now = new Date()): Category {
    if (this.isInactive()) {
      throw new ValidationError(
        'CATEGORY_INACTIVE_RENAME',
        'Cannot rename an inactive category',
      );
    }

    const normalized = Category.normalizeName(name);

    if (normalized === this.name) {
      return this;
    }

    return new Category({
      ...this,
      name: normalized,
      updatedAt: now,
    });
  }

  changeSortOrder(sortOrder: number, now = new Date()): Category {
    if (this.isInactive()) {
      throw new ValidationError(
        'CATEGORY_INACTIVE_SORT_ORDER_CHANGE',
        'Cannot change sort order of an inactive category',
      );
    }

    if (sortOrder === this.sortOrder) {
      return this;
    }

    return new Category({
      ...this,
      sortOrder,
      updatedAt: now,
    });
  }

  disable(now = new Date()): Category {
    if (this.isInactive()) {
      return this;
    }

    return new Category({
      ...this,
      status: CategoryStatus.INACTIVE,
      updatedAt: now,
    });
  }

  enable(now = new Date()): Category {
    if (this.isActive()) {
      return this;
    }

    return new Category({
      ...this,
      status: CategoryStatus.ACTIVE,
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.name || this.name.length < 3) {
      throw new ValidationError(
        'CATEGORY_INVALID_NAME',
        'Category name must be at least 3 characters',
      );
    }

    if (this.sortOrder < 0) {
      throw new ValidationError(
        'CATEGORY_INVALID_SORT_ORDER',
        'Sort order cannot be negative',
      );
    }
  }

  private static normalizeName(name: string): string {
    return name.trim();
  }
}
