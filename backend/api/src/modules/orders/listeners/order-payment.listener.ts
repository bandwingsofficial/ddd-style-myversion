import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PaymentEvents } from '../../payments/events/payment-events.constants';

import { OrderStatusService } from '../services/order-status.service';
import { CartOrchestratorService } from '../../cart/services/cart-orchestrator.service';

@Injectable()
export class OrderPaymentListener {
  private readonly logger = new Logger(OrderPaymentListener.name);

  constructor(
    private readonly orderStatusService: OrderStatusService,
    private readonly cartOrchestrator: CartOrchestratorService,
  ) {}

  @OnEvent(PaymentEvents.PAYMENT_SUCCESS)
  async handlePaymentSuccess(payload: {
    orderId: string;
    paymentId?: string;
  }): Promise<void> {
    this.logger.log(
      `[Payment Updated] Finalizing order after payment success orderId=${payload.orderId} paymentId=${payload.paymentId ?? 'n/a'}`,
    );

    const order = await this.orderStatusService.markPaidAndConfirm(
      payload.orderId,
    );

    this.logger.log(
      `[Order Updated] orderId=${order.id} orderStatus=${order.status}`,
    );

    const cleared = await this.cartOrchestrator.clearCartAfterPayment({
      customerId: order.customerId,
      outletId: order.outletId,
    });

    this.logger.log(
      cleared
        ? `[Cart Cleared] cartId=${cleared.id} customerId=${order.customerId}`
        : `[Cart Cleared] No open cart for customerId=${order.customerId}`,
    );
  }

  @OnEvent(PaymentEvents.PAYMENT_FAILED)
  async handlePaymentFailed(payload: {
    orderId: string;
    paymentId?: string;
  }): Promise<void> {
    this.logger.warn(
      `[Payment Failed] orderId=${payload.orderId} paymentId=${payload.paymentId ?? 'n/a'} — checkout remains active for retry`,
    );
  }
}
