// src/modules/inventory/domain/value-objects/inventory-id.vo.ts

import { randomUUID } from 'crypto';

export class InventoryId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
    Object.freeze(this);
  }

  static generate(): InventoryId {
    return new InventoryId(randomUUID());
  }

  static fromExisting(id: string): InventoryId {
    if (!id) {
      throw new Error('InventoryId cannot be empty');
    }
    return new InventoryId(id);
  }

  equals(other?: InventoryId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  getRaw(): string {
    return this.value;
  }
}
