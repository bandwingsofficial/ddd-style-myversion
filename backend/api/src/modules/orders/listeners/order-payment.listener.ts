import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PaymentEvents } from '../../payments/events/payment-events.constants';

import { OrderStatusService } from '../services/order-status.service';
import { CartOrchestratorService } from '../../cart/services/cart-orchestrator.service';
import { OrderRepository } from '../repositories/order.repository';

@Injectable()
export class OrderPaymentListener {
  constructor(
    private readonly orderStatusService: OrderStatusService,
    private readonly cartOrchestrator: CartOrchestratorService,
    private readonly orderRepo: OrderRepository,
  ) {}

  @OnEvent(PaymentEvents.PAYMENT_SUCCESS)
  async handlePaymentSuccess(payload: {
    orderId: string;
  }): Promise<void> {
    let order;

    try {
      order = await this.orderStatusService.markPaid(payload.orderId);
    } catch (err: any) {
      if (err?.message?.includes('Cannot mark paid')) {
        return;
      }
      throw err;
    }

    try {
      await this.cartOrchestrator.clearCart({
        customerId: order.customerId,
        outletId: order.outletId,
      });
    } catch {
      // Cart may already be cleared after successful checkout
    }
  }

  /**
   * Payment attempt failed — checkout stays active for unlimited retries.
   * Do NOT unlock cart or fail the order.
   */
  @OnEvent(PaymentEvents.PAYMENT_FAILED)
  async handlePaymentFailed(_payload: {
    orderId: string;
  }): Promise<void> {
    // Intentionally no-op: order remains PAYMENT_PENDING, cart stays locked.
  }
}
