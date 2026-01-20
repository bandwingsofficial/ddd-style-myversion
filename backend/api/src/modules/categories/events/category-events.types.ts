// src/modules/categories/events/category-events.types.ts

/* ================================================= */
/* LIFECYCLE                                         */
/* ================================================= */

export interface CategoryLifecycleEvent {
  categoryId: string;
}

/* ================================================= */
/* UPDATE                                            */
/* ================================================= */

export interface CategoryUpdatedEvent {
  categoryId: string;
  name?: string; // optional to allow non-name updates
}

/* ================================================= */
/* SORT ORDER                                        */
/* ================================================= */

export interface CategorySortOrderChangedEvent {
  categoryId: string;
  sortOrder: number;
}

/* ================================================= */
/* IMAGE EVENTS (NEW)                                 */
/* ================================================= */

export interface CategoryImageUpdatedEvent {
  categoryId: string;
  imagePath: string;
}

export interface CategoryImageRemovedEvent {
  categoryId: string;
}
