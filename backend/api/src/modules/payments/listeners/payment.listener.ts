import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PaymentPublicGateway } from '../gateways/payment-public.gateway';
import { PaymentSocketEvent } from '../events/payment-events.types';
import { PaymentEvents } from '../events/payment-events.constants';

@Injectable()
export class PaymentPublicListener {
  private emitTimeout: NodeJS.Timeout | null = null;
  private lastPayload: PaymentSocketEvent | null = null;

  constructor(
    private readonly gateway: PaymentPublicGateway,
  ) {}

  /* ================================================= */
  /* INTERNAL FLUSH (safe async wrapper)               */
  /* ================================================= */

  private async flush(): Promise<void> {
    if (!this.lastPayload) return;

    const payload = this.lastPayload;

    this.lastPayload = null;
    this.emitTimeout = null;

    try {
      console.log(
        '📡 [PAYMENT SOCKET] payment.updated →',
        payload,
      );

      await this.gateway.emitPaymentUpdate(payload);
    } catch (err) {
      console.error('[PAYMENT SOCKET ERROR]', err);
    }
  }

  /* ================================================= */
  /* 🔥 BATCHED REAL-TIME EMIT                          */
  /* ================================================= */

  private scheduleEmit(payload: PaymentSocketEvent): void {
    // only keep latest state
    this.lastPayload = payload;

    if (this.emitTimeout) {
      clearTimeout(this.emitTimeout);
    }

    this.emitTimeout = setTimeout(() => {
      this.flush();
    }, 50);
  }

  /* ================================================= */
  /* 🔥 LISTEN TO ALL PAYMENT EVENTS                    */
  /* ================================================= */

  @OnEvent('payment.*') // lifecycle events only
  handleAllPaymentEvents(payload: PaymentSocketEvent): void {
    this.scheduleEmit(payload);
  }
}
