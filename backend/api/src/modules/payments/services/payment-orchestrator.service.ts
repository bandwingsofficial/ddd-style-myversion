import { Injectable } from '@nestjs/common';

import { PaymentService } from './payment.service';
import { Payment } from '../domain/models/payment.model';

import { ValidationError } from '../../../common/errors';

@Injectable()
export class PaymentOrchestratorService {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  /* ================================================= */
  /* PAYMENT – CREATE                                  */
  /* ================================================= */

/* ================================================= */
/* PAYMENT – CREATE                                  */
/* ================================================= */

async createPayment(params: {
  orderId: string;
}): Promise<{
  payment: Payment;
  razorpayOrderId: string;   // 🔥 NEW
  checkoutUrl: string | null;
}> {

  const { orderId } = params;

  if (!orderId) {
    throw new ValidationError(
      'ORDER_ID_REQUIRED',
      'Order id is required',
    );
  }

  return this.paymentService.createPayment({ orderId });
}
  /* ================================================= */
  /* PAYMENT – CONFIRM                                 */
  /* ================================================= */

  async confirmPayment(params: {
    paymentId: string;
  }): Promise<Payment> {

    const { paymentId } = params;

    if (!paymentId) {
      throw new ValidationError(
        'PAYMENT_ID_REQUIRED',
        'Payment id is required',
      );
    }

    return this.paymentService.confirmPayment({ paymentId });
  }

  /* ================================================= */
  /* PAYMENT – WEBHOOK                                 */
  /* ================================================= */

  async handleWebhook(params: {
    payload: unknown;
    signature?: string;
  }): Promise<void> {
    // 🔥 keep orchestrator dumb — just forward
    return this.paymentService.handleWebhook(params);
  }

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  async getPaymentById(paymentId: string): Promise<Payment> {
    if (!paymentId) {
      throw new ValidationError(
        'PAYMENT_ID_REQUIRED',
        'Payment id is required',
      );
    }

    return this.paymentService.getById(paymentId);
  }

  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    if (!orderId) {
      return []; // read → safe default
    }

    return this.paymentService.getByOrderId(orderId);
  }
}
