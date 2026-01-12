import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CategoryEvents } from '../events/category-events.constants';
import {
  CategoryLifecycleEvent,
  CategoryUpdatedEvent,
  CategorySortOrderChangedEvent,
} from '../events/category-events.types';

import { CategoryPublicGateway } from '../gateways/category-public.gateway';

@Injectable()
export class CategoryPublicListener {
  constructor(
    private readonly gateway: CategoryPublicGateway,
  ) {}

  /* ================================================= */
  /* LIFECYCLE                                         */
  /* ================================================= */

  @OnEvent(CategoryEvents.CATEGORY_CREATED)
  handleCategoryCreated(
    event: CategoryLifecycleEvent,
  ): void {
    this.gateway.emitCategoryCreated({
      categoryId: event.categoryId,
    });
  }

  @OnEvent(CategoryEvents.CATEGORY_ENABLED)
  handleCategoryEnabled(
    event: CategoryLifecycleEvent,
  ): void {
    this.gateway.emitCategoryEnabled({
      categoryId: event.categoryId,
    });
  }

  @OnEvent(CategoryEvents.CATEGORY_DISABLED)
  handleCategoryDisabled(
    event: CategoryLifecycleEvent,
  ): void {
    this.gateway.emitCategoryDisabled({
      categoryId: event.categoryId,
    });
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  @OnEvent(CategoryEvents.CATEGORY_UPDATED)
  handleCategoryUpdated(
    event: CategoryUpdatedEvent,
  ): void {
    this.gateway.emitCategoryUpdated({
      categoryId: event.categoryId,
      name: event.name,
    });
  }

  /* ================================================= */
  /* SORT ORDER                                        */
  /* ================================================= */

  @OnEvent(CategoryEvents.CATEGORY_SORT_ORDER_CHANGED)
  handleCategorySortOrderChanged(
    event: CategorySortOrderChangedEvent,
  ): void {
    this.gateway.emitCategorySortOrderChanged({
      categoryId: event.categoryId,
      sortOrder: event.sortOrder,
    });
  }
}
