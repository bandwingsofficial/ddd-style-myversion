import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentGatewayService } from './payment-gateway.service';

import { OrderRepository } from '../../orders/repositories/order.repository';

import { Payment } from '../domain/models/payment.model';
import { PaymentMethod } from '../domain/enums/payment-method.enum';

import { ValidationError } from '../../../common/errors';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRepo: PaymentRepository,
    private readonly orderRepo: OrderRepository,
    private readonly gateway: PaymentGatewayService,
  ) {}

  /* ================================================= */
  /* CREATE PAYMENT SESSION (SAFE)                     */
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

    /* ================================================= */
    /* PHASE 1 — DB ONLY                                 */
    /* ================================================= */

    const { payment, amount } = await this.prisma.$transaction(
      async (tx) => {
        const order = await this.orderRepo.findById(
          params.orderId,
          tx,
        );

        if (!order) {
          throw new ValidationError(
            'ORDER_NOT_FOUND',
            'Order not found',
          );
        }

        const amount = order.grandTotal.toNumber();

        const payment = Payment.createNew({
          id: uuid(),
          orderId: order.id,
          method: PaymentMethod.ONLINE,
          amount,
          provider: 'MOCK_GATEWAY',
        });

        const saved = await this.paymentRepo.create(payment, tx);

        const pendingOrder = order.markPaymentPending();
        await this.orderRepo.update(pendingOrder, tx);

        return { payment: saved, amount };
      },
    );

    /* ================================================= */
    /* PHASE 2 — EXTERNAL (NO TX 🔥)                     */
    /* ================================================= */

    const session = await this.gateway.createPaymentSession({
      orderId: payment.orderId,
      amount,
      currency: 'INR',
    });

    /* ================================================= */
    /* PHASE 3 — SAVE PROVIDER REF                       */
    /* ================================================= */

    const updated = payment.attachProviderRef(
      session.providerPaymentId,
    );

    await this.paymentRepo.update(updated);

    return {
      payment: updated,
      checkoutUrl: session.checkoutUrl,
    };
  }

  /* ================================================= */
  /* CONFIRM PAYMENT (SAFE + IDEMPOTENT)               */
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

    const payment = await this.paymentRepo.findById(
      params.paymentId,
    );

    if (!payment) {
      throw new ValidationError(
        'PAYMENT_NOT_FOUND',
        'Payment not found',
      );
    }

    /* -------- idempotent -------- */
    if (payment.isCompleted?.()) {
      return payment;
    }

    /* ================================================= */
    /* EXTERNAL FIRST 🔥                                 */
    /* ================================================= */

    const verification = await this.gateway.verifyPayment({
      providerPaymentId: payment.providerRefId!,
    });

    /* ================================================= */
    /* DB UPDATE ONLY                                   */
    /* ================================================= */

    return this.prisma.$transaction(async (tx) => {

      const freshPayment = await this.paymentRepo.findById(
        payment.id,
        tx,
      );

      const order = await this.orderRepo.findById(
        payment.orderId,
        tx,
      );

      if (!freshPayment || !order) {
        throw new ValidationError('PAYMENT_INVALID', 'Invalid payment');
      }

      let updatedPayment: Payment;
      let updatedOrder;

      if (verification.success) {
        updatedPayment = freshPayment.markSuccess({
          transactionId: verification.providerPaymentId,
        });

        updatedOrder = order.markPaid();
      } else {
        updatedPayment = freshPayment.markFailed();
        updatedOrder = order.fail();
      }

      await this.paymentRepo.update(updatedPayment, tx);
      await this.orderRepo.update(updatedOrder, tx);

      return updatedPayment;
    });
  }

  /* ================================================= */
  /* WEBHOOK (FAST + SAFE)                             */
  /* ================================================= */

  async handleWebhook(params: {
    payload: unknown;
    signature?: string;
  }): Promise<void> {
    const payload = params.payload as any;

    const providerPaymentId = payload?.providerPaymentId;
    if (!providerPaymentId) return;

    const payment =
      await this.paymentRepo.findByProviderRefId(
        providerPaymentId,
      );

    if (!payment) return;

    await this.confirmPayment({
      paymentId: payment.id,
    });
  }

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  async getById(paymentId: string): Promise<Payment> {
    if (!paymentId) {
      throw new ValidationError(
        'PAYMENT_ID_REQUIRED',
        'Payment id is required',
      );
    }

    const payment = await this.paymentRepo.findById(paymentId);

    if (!payment) {
      throw new ValidationError(
        'PAYMENT_NOT_FOUND',
        'Payment not found',
      );
    }

    return payment;
  }

  async getByOrderId(orderId: string): Promise<Payment[]> {
    return this.paymentRepo.findAllByOrderId(orderId);
  }
}
