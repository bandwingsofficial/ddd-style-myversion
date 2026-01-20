// src/modules/categories/events/category-events.service.ts

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CategoryEvents } from './category-events.constants';
import {
  CategoryLifecycleEvent,
  CategoryUpdatedEvent,
  CategorySortOrderChangedEvent,
} from './category-events.types';

@Injectable()
export class CategoryEventsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /* ================================================= */
  /* CATEGORY LIFECYCLE                                */
  /* ================================================= */

  emitCategoryCreated(
    payload: CategoryLifecycleEvent,
  ): void {
    this.eventEmitter.emit(
      CategoryEvents.CATEGORY_CREATED,
      payload,
    );
  }

  emitCategoryEnabled(
    payload: CategoryLifecycleEvent,
  ): void {
    this.eventEmitter.emit(
      CategoryEvents.CATEGORY_ENABLED,
      payload,
    );
  }

  emitCategoryDisabled(
    payload: CategoryLifecycleEvent,
  ): void {
    this.eventEmitter.emit(
      CategoryEvents.CATEGORY_DISABLED,
      payload,
    );
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  emitCategoryUpdated(
    payload: CategoryUpdatedEvent,
  ): void {
    this.eventEmitter.emit(
      CategoryEvents.CATEGORY_UPDATED,
      payload,
    );
  }

  /**
   * 🔥 Image replaced or added
   */
  emitCategoryImageUpdated(payload: {
    categoryId: string;
    imagePath: string;
  }): void {
    this.eventEmitter.emit(
      CategoryEvents.CATEGORY_IMAGE_UPDATED,
      payload,
    );
  }

  /**
   * 🗑️ Image removed
   */
  emitCategoryImageRemoved(payload: {
    categoryId: string;
  }): void {
    this.eventEmitter.emit(
      CategoryEvents.CATEGORY_IMAGE_REMOVED,
      payload,
    );
  }

  /* ================================================= */
  /* SORT ORDER                                        */
  /* ================================================= */

  emitCategorySortOrderChanged(
    payload: CategorySortOrderChangedEvent,
  ): void {
    this.eventEmitter.emit(
      CategoryEvents.CATEGORY_SORT_ORDER_CHANGED,
      payload,
    );
  }
}
