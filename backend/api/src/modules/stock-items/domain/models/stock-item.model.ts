import { ValidationError } from '../../../../common/errors';
import { StockItemStatus } from '../enums/stock-item-status.enum';
import { Unit } from '../enums/unit.enum';

export interface StockItemProps {
  id: string;
  name: string;
  unit: Unit;
  status: StockItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class StockItem {
  readonly id: string;
  readonly name: string;
  readonly unit: Unit;
  readonly status: StockItemStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private static readonly MIN_NAME_LENGTH = 2;
  private static readonly MAX_NAME_LENGTH = 100;

  private constructor(props: StockItemProps) {
    Object.assign(this, props);
    this.assertValidState();
    Object.freeze(this);
  }

  static createNew(params: {
    id: string;
    name: string;
    unit: Unit;
    now?: Date;
  }): StockItem {
    const now = params.now ?? new Date();

    return new StockItem({
      id: params.id,
      name: StockItem.validateNameInput(params.name),
      unit: params.unit,
      status: StockItemStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: StockItemProps): StockItem {
    return new StockItem({
      ...props,
      name: props.name.trim(),
    });
  }

  static validateNameInput(raw: string): string {
    const trimmed = raw.trim();

    if (!trimmed) {
      throw new ValidationError(
        'STOCK_ITEM_NAME_REQUIRED',
        'Stock item name is required.',
        { errors: { name: 'Stock item name is required.' } },
      );
    }

    if (raw !== trimmed) {
      throw new ValidationError(
        'STOCK_ITEM_NAME_WHITESPACE',
        'Stock item name cannot have leading or trailing spaces.',
        {
          errors: {
            name: 'Stock item name cannot have leading or trailing spaces.',
          },
        },
      );
    }

    if (trimmed.length < StockItem.MIN_NAME_LENGTH) {
      throw new ValidationError(
        'STOCK_ITEM_NAME_TOO_SHORT',
        'Stock item name must be at least 2 characters.',
        {
          errors: {
            name: 'Stock item name must be at least 2 characters.',
          },
        },
      );
    }

    if (trimmed.length > StockItem.MAX_NAME_LENGTH) {
      throw new ValidationError(
        'STOCK_ITEM_NAME_TOO_LONG',
        'Stock item name cannot exceed 100 characters.',
        {
          errors: {
            name: 'Stock item name cannot exceed 100 characters.',
          },
        },
      );
    }

    return trimmed;
  }

  static toSku(id: string): string {
    return id.slice(-8).toUpperCase();
  }

  isActive(): boolean {
    return this.status === StockItemStatus.ACTIVE;
  }

  isInactive(): boolean {
    return this.status === StockItemStatus.INACTIVE;
  }

  update(
    params: {
      name?: string;
      unit?: Unit;
    },
    now = new Date(),
  ): StockItem {
    if (this.isInactive()) {
      throw new ValidationError(
        'STOCK_ITEM_INACTIVE_UPDATE',
        'Cannot edit inactive stock item. Activate it first.',
        {
          errors: {
            name: 'Cannot edit inactive stock item. Activate it first.',
          },
        },
      );
    }

    return new StockItem({
      ...this,
      name:
        params.name !== undefined
          ? StockItem.validateNameInput(params.name)
          : this.name,
      unit: params.unit ?? this.unit,
      updatedAt: now,
    });
  }

  changeStatus(status: StockItemStatus, now = new Date()): StockItem {
    if (this.status === status) {
      return this;
    }

    return new StockItem({
      ...this,
      status,
      updatedAt: now,
    });
  }

  private assertValidState(): void {
    if (!this.name || this.name.trim().length < StockItem.MIN_NAME_LENGTH) {
      throw new ValidationError(
        'STOCK_ITEM_INVALID_NAME',
        'Stock item name must be at least 2 characters.',
        {
          errors: {
            name: 'Stock item name must be at least 2 characters.',
          },
        },
      );
    }

    if (!this.unit) {
      throw new ValidationError(
        'STOCK_ITEM_INVALID_UNIT',
        'Stock item unit is required.',
        { errors: { unit: 'Stock item unit is required.' } },
      );
    }
  }
}
