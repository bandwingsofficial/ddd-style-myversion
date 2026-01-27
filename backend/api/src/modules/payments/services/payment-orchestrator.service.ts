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
  /* PAYMENT – CREATE                                 */
  /* ================================================= */

  async createPayment(params: {
    orderId: string;
  }): Promise<{
    payment: Payment;
    checkoutUrl: string;
  }> {
    if (!params?.orderId) {
      throw new ValidationError(
        'ORDER_ID_REQUIRED',
        'Order id is required',
      );
    }

    return this.paymentService.createPayment(params);
  }

  /* ================================================= */
  /* PAYMENT – CONFIRM (MANUAL VERIFY)                 */
  /* ================================================= */

  async confirmPayment(params: {
    paymentId: string;
  }): Promise<Payment> {
    if (!params?.paymentId) {
      throw new ValidationError(
        'PAYMENT_ID_REQUIRED',
        'Payment id is required',
      );
    }

    return this.paymentService.confirmPayment(params);
  }

  /* ================================================= */
  /* PAYMENT – WEBHOOK (AUTO VERIFY)                   */
  /* ================================================= */

  async handleWebhook(params: {
    payload: unknown;
    signature?: string;
  }): Promise<void> {
    if (!params?.payload) return;

    return this.paymentService.handleWebhook(params);
  }

  /* ================================================= */
  /* PAYMENT – READS                                  */
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

  async getPaymentsByOrderId(
    orderId: string,
  ): Promise<Payment[]> {
    if (!orderId) return [];

    return this.paymentService.getByOrderId(orderId);
  }
}
