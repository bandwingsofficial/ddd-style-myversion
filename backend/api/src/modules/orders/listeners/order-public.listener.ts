import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { OrderPublicGateway } from '../gateways/order-public.gateway';

@Injectable()
export class OrderPublicListener {
  private emitTimeout: NodeJS.Timeout | null = null;
  private lastPayload: any = null;

  constructor(private readonly gateway: OrderPublicGateway) {}

  /* ================================================= */
  /* 🔥 BATCHED EMIT                                   */
  /* ================================================= */

  private scheduleEmit(payload: any): void {
    this.lastPayload = payload;

    if (this.emitTimeout) {
      clearTimeout(this.emitTimeout);
    }

    this.emitTimeout = setTimeout(async () => {
      console.log('📡 [ORDER LISTENER] emitting order update');

      await this.gateway.emitOrderUpdate(this.lastPayload);

      this.emitTimeout = null;
    }, 50);
  }

  /* ================================================= */
  /* LISTEN TO ALL ORDER EVENTS                        */
  /* ================================================= */

  @OnEvent('order.*')
  async handleAll(payload: any): Promise<void> {
    console.log('🔥 [EVENT LISTENER] order.* fired:', payload);
    this.scheduleEmit(payload);
  }
}
