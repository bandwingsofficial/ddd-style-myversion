import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PaymentEvents } from '../../payments/events/payment-events.constants';

import { OrderStatusService } from '../services/order-status.service';
import { CartOrchestratorService } from '../../cart/services/cart-orchestrator.service';

/**
 * =================================================
 * ORDER ⇄ PAYMENT GLUE (DOMAIN LISTENER)
 * =================================================
 *
 * This is BUSINESS logic (NOT socket).
 *
 * payment.success  → order.PAID
 * payment.failed   → order.FAILED
 *
 * OrderStatusService handles:
 *   • DB update
 *   • OrderEvent history
 *   • order.* events
 *   • socket updates automatically
 *
 * So this listener stays VERY thin.
 */
@Injectable()
export class OrderPaymentListener {
  constructor(
    private readonly orderStatusService: OrderStatusService,
    private readonly cartOrchestrator: CartOrchestratorService,
  ) {}

  /* ================================================= */
  /* PAYMENT SUCCESS → ORDER PAID                       */
  /* ================================================= */

@OnEvent(PaymentEvents.PAYMENT_SUCCESS)
async handlePaymentSuccess(payload: {
  orderId: string;
}): Promise<void> {

  console.log(
    '💚 payment.success → mark order PAID + clear cart',
    payload.orderId,
  );

  /* 1️⃣ mark paid */
  const order = await this.orderStatusService.markPaid(payload.orderId);

  /* 2️⃣ clear cart (safe) */
  try {
    await this.cartOrchestrator.clearCart({
      customerId: order.customerId,
    });
  } catch (err) {
    console.error('[AUTO CLEAR CART FAILED]', err);
  }
}

  /* ================================================= */
  /* PAYMENT FAILED → ORDER FAILED                      */
  /* ================================================= */

  @OnEvent(PaymentEvents.PAYMENT_FAILED)
async handlePaymentFailed(payload: {
  orderId: string;
}): Promise<void> {

  console.log(
    '🔥 payment.failed → mark FAILED + unlock cart',
    payload.orderId,
  );

  const order = await this.orderStatusService.fail(payload.orderId);

  try {
    await this.cartOrchestrator.unlockCart({
      customerId: order.customerId,
    });
  } catch (err) {
    console.error('[UNLOCK CART FAILED]', err);
  }
}
}