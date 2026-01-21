import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CategoryPublicGateway } from '../gateways/category-public.gateway';

@Injectable()
export class CategoryPublicListener {
  private emitTimeout: NodeJS.Timeout | null = null;

  constructor(
    private readonly gateway: CategoryPublicGateway,
  ) {}

  /* ================================================= */
  /* 🔥 BATCHED REAL-TIME EMIT                          */
  /* ================================================= */

  private scheduleEmit(): void {
    if (this.emitTimeout) {
      clearTimeout(this.emitTimeout);
    }

    this.emitTimeout = setTimeout(async () => {
      await this.gateway.emitFullCategories();
      this.emitTimeout = null;
    }, 50); // 🔥 batch window (50ms)
  }

  /* ================================================= */
  /* 🔥 LISTEN TO ALL CATEGORY EVENTS                   */
  /* ================================================= */

  @OnEvent('category.*')
  async handleAllCategoryEvents(): Promise<void> {
    this.scheduleEmit();
  }
}
