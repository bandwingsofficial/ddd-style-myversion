import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { DeliveryPublicGateway } from '../gateways/delivery-public.gateway';
import { DeliverySocketEvent } from '../events/delivery-events.types';

@Injectable()
export class DeliveryPublicListener {
  private emitTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastPayload: DeliverySocketEvent | null = null;

  constructor(
    private readonly gateway: DeliveryPublicGateway,
  ) {}

  /* ================================================= */
  /* 🔥 BATCHED REAL-TIME EMIT                         */
  /* ================================================= */

  private scheduleEmit(payload: DeliverySocketEvent): void {
    if (!payload) return;

    // keep only latest state (GPS spam safe)
    this.lastPayload = payload;

    if (this.emitTimeout) {
      clearTimeout(this.emitTimeout);
    }

    this.emitTimeout = setTimeout(async () => {
      if (!this.lastPayload) return;

      console.log(
        '📡 [DELIVERY LISTENER] emitting delivery update',
        this.lastPayload,
      );

      await this.gateway.emitDeliveryUpdate(this.lastPayload);

      this.lastPayload = null;
      this.emitTimeout = null;
    }, 50);
  }

  /* ================================================= */
  /* 🔥 LISTEN TO ALL DELIVERY EVENTS                  */
  /* ================================================= */

  @OnEvent('delivery.*')
  async handleAll(payload: DeliverySocketEvent): Promise<void> {
    console.log(
      '🔥 [EVENT LISTENER] delivery.* fired:',
      payload,
    );

    this.scheduleEmit(payload);
  }
}
