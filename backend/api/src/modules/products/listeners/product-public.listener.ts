import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ProductPublicGateway } from '../gateways/product-public.gateway';

@Injectable()
export class ProductPublicListener {
  private emitTimeout: NodeJS.Timeout | null = null;

  constructor(
    private readonly gateway: ProductPublicGateway,
  ) {}

  /* ================================================= */
  /* 🔥 BATCHED REAL-TIME EMIT                          */
  /* ================================================= */

  private scheduleEmit(): void {
    if (this.emitTimeout) {
      clearTimeout(this.emitTimeout);
    }

    this.emitTimeout = setTimeout(async () => {
      await this.gateway.emitFullProducts();
      this.emitTimeout = null;
    }, 50); // 🔥 batch window (50ms)
  }

  /* ================================================= */
  /* 🔥 LISTEN TO ALL PRODUCT EVENTS                   */
  /* ================================================= */

  @OnEvent('product.*')
  async handleAllProductEvents(): Promise<void> {
    this.scheduleEmit();
  }
}
