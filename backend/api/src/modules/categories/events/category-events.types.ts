// src/modules/categories/events/category-events.types.ts

export interface CategoryLifecycleEvent {
  categoryId: string;
}

export interface CategoryUpdatedEvent {
  categoryId: string;
  name: string;
}

export interface CategorySortOrderChangedEvent {
  categoryId: string;
  sortOrder: number;
}
