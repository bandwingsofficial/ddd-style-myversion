import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CategoryEvents } from '../events/category-events.constants';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryPublicGateway } from '../gateways/category-public.gateway';

@Injectable()
export class CategoryPublicListener {
  constructor(
    private readonly gateway: CategoryPublicGateway,
    private readonly categoryRepo: CategoryRepository,
  ) {}

  /* ================================================= */
  /* SINGLE SOURCE OF TRUTH (PUBLIC STATE)              */
  /* ================================================= */

  private async emitFullCategoryList(): Promise<void> {
    const categories =
      await this.categoryRepo.findAll(false); // ACTIVE only

    const payload = categories.map((c) => {
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        sortOrder: c.sortOrder,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    this.gateway.emitCategoriesUpdated({
      categories: payload,
    });
  }

  /* ================================================= */
  /* LIFECYCLE EVENTS                                  */
  /* ================================================= */

  @OnEvent(CategoryEvents.CATEGORY_CREATED)
  async handleCategoryCreated(): Promise<void> {
    await this.emitFullCategoryList();
  }

  @OnEvent(CategoryEvents.CATEGORY_ENABLED)
  async handleCategoryEnabled(): Promise<void> {
    await this.emitFullCategoryList();
  }

  @OnEvent(CategoryEvents.CATEGORY_DISABLED)
  async handleCategoryDisabled(): Promise<void> {
    await this.emitFullCategoryList();
  }

  /* ================================================= */
  /* UPDATE EVENTS                                     */
  /* ================================================= */

  @OnEvent(CategoryEvents.CATEGORY_UPDATED)
  async handleCategoryUpdated(): Promise<void> {
    await this.emitFullCategoryList();
  }

  /* ================================================= */
  /* SORT ORDER EVENTS                                 */
  /* ================================================= */

  @OnEvent(CategoryEvents.CATEGORY_SORT_ORDER_CHANGED)
  async handleCategorySortOrderChanged(): Promise<void> {
    await this.emitFullCategoryList();
  }
}
