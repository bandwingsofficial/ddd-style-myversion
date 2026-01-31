import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentGatewayService } from './payment-gateway.service';

import { OrderRepository } from '../../orders/repositories/order.repository';

import { Payment } from '../domain/models/payment.model';
import { PaymentMethod } from '../domain/enums/payment-method.enum';

import { ValidationError } from '../../../common/errors';

import { PaymentEventsService } from '../events/payment-events.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRepo: PaymentRepository,
    private readonly orderRepo: OrderRepository,
    private readonly gateway: PaymentGatewayService,
    private readonly paymentEvents: PaymentEventsService,
  ) {}

/* ================================================= */
/* CREATE PAYMENT SESSION (SAFE)                     */
/* ================================================= */

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

      const order = await this.orderRepo.findById(params.orderId, tx);

      if (!order) {
        throw new ValidationError('ORDER_NOT_FOUND', 'Order not found');
      }

      /* 🔥 prevent duplicate payments */
      if (!order.isCreated()) {
        throw new ValidationError(
          'ORDER_NOT_PAYABLE',
          'Payment already initiated for this order',
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
  /* 🔥 EMIT AFTER COMMIT (CORRECT SPOT)                */
  /* ================================================= */

  this.paymentEvents.emitPaymentInitiated({
    paymentId: payment.id,
    orderId: payment.orderId,
    amount,
    occurredAt: new Date(),
  });

  /* ================================================= */
  /* PHASE 2 — EXTERNAL (NO TX 🔥)                     */
  /* ================================================= */

  const session = await this.gateway.createPaymentSession({
    orderId: payment.orderId,
    amount,
    currency: 'INR', // 🔥 system currency (simple + safe)
  });

  /* ================================================= */
  /* PHASE 3 — SAVE PROVIDER REF (atomic)               */
  /* ================================================= */

  const updated = payment.attachProviderRef(
    session.providerPaymentId,
  );

  await this.prisma.$transaction(async (tx) => {
    await this.paymentRepo.update(updated, tx);
  });

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

  const payment = await this.paymentRepo.findById(params.paymentId);

  if (!payment) {
    throw new ValidationError(
      'PAYMENT_NOT_FOUND',
      'Payment not found',
    );
  }

  /* 🔥 provider ref must exist */
  if (!payment.providerRefId) {
    throw new ValidationError(
      'PROVIDER_REF_MISSING',
      'Provider reference missing',
    );
  }

  /* ================================================= */
  /* EXTERNAL FIRST (provider verification) 🔥          */
  /* ================================================= */

  const verification = await this.gateway.verifyPayment({
    providerPaymentId: payment.providerRefId,
  });

  /* ================================================= */
  /* DB UPDATE — PAYMENT ONLY (atomic + idempotent)    */
  /* ================================================= */

  const updatedPayment = await this.prisma.$transaction(async (tx) => {

    const freshPayment = await this.paymentRepo.findById(
      payment.id,
      tx,
    );

    if (!freshPayment) {
      throw new ValidationError(
        'PAYMENT_INVALID',
        'Invalid payment',
      );
    }

    /* 🔥 atomic idempotency */
    if (freshPayment.isCompleted()) {
      return freshPayment;
    }

    let newPayment: Payment;

    if (verification.success) {
      newPayment = freshPayment.markSuccess({
        transactionId: verification.providerPaymentId,
      });
    } else {
      newPayment = freshPayment.markFailed();
    }

    await this.paymentRepo.update(newPayment, tx);

    return newPayment;
  });

  /* ================================================= */
  /* 🔥 EMIT EVENTS (Order reacts separately)           */
  /* ================================================= */

  if (updatedPayment.isSuccess()) {
    this.paymentEvents.emitPaymentSuccess({
      paymentId: updatedPayment.id,
      orderId: updatedPayment.orderId,
      amount: updatedPayment.amount.toNumber(),
      transactionId: updatedPayment.transactionId!,
      occurredAt: new Date(),
    });
  } else {
    this.paymentEvents.emitPaymentFailed({
      paymentId: updatedPayment.id,
      orderId: updatedPayment.orderId,
      amount: updatedPayment.amount.toNumber(),
      occurredAt: new Date(),
    });
  }

  return updatedPayment;
}
  /* ================================================= */
/* WEBHOOK (FAST + SAFE)                             */
/* ================================================= */

async handleWebhook(params: {
  payload: unknown;
  signature?: string;
}): Promise<void> {

  try {
    /* ---------------------------------------------- */
    /* 🔥 optional: verify signature                   */
    /* ---------------------------------------------- */

    // TODO: implement real provider signature verification
    // this.gateway.verifyWebhookSignature(params.signature, params.payload);

    /* ---------------------------------------------- */
    /* safe payload parsing                            */
    /* ---------------------------------------------- */

    const payload = params.payload as {
      providerPaymentId?: string;
    };

    const providerPaymentId = payload?.providerPaymentId;

    if (!providerPaymentId) return;

    /* ---------------------------------------------- */
    /* find payment                                    */
    /* ---------------------------------------------- */

    const payment =
      await this.paymentRepo.findByProviderRefId(
        providerPaymentId,
      );

    if (!payment) return;

    /* ---------------------------------------------- */
    /* idempotent confirm                              */
    /* ---------------------------------------------- */

    await this.confirmPayment({
      paymentId: payment.id,
    });

  } catch (err) {
    /* 🔥 NEVER throw in webhook */
    console.error('[PAYMENT WEBHOOK ERROR]', err);
  }
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
