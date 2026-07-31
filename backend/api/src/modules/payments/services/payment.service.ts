import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { PaymentRepository } from '../repositories/payment.repository';
import { PaymentGatewayService } from './payment-gateway.service';

import { OrderRepository } from '../../orders/repositories/order.repository';

import { Payment } from '../domain/models/payment.model';
import { PaymentMethod } from '../domain/enums/payment-method.enum';

import { ValidationError } from '../../../common/errors';

import { PaymentEventsService } from '../events/payment-events.service';
import { OrderStatus } from '../../orders/domain/enums/order-status.enum';


@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentRepo: PaymentRepository,
    private readonly orderRepo: OrderRepository,
    private readonly gateway: PaymentGatewayService,
    private readonly paymentEvents: PaymentEventsService,
  ) {}

/* ================================================= */
/* CREATE PAYMENT SESSION (REAL RAZORPAY)             */
/* ================================================= */

async createPayment(params: {
  orderId: string;
}): Promise<{
  payment: Payment;
  razorpayOrderId: string;
  amountInPaise: number;
  checkoutUrl: string | null;
}> {

  if (!params?.orderId) {
    throw new ValidationError(
      'ORDER_ID_REQUIRED',
      'Order id is required',
    );
  }

  /* ================================================= */
  /* PHASE 1 — DB                                      */
  /* ================================================= */

  const { payment, amount } = await this.prisma.$transaction(
    async (tx) => {

      const order = await this.orderRepo.findById(params.orderId, tx);

      if (!order) {
        throw new ValidationError('ORDER_NOT_FOUND', 'Order not found');
      }

      if (!order.isCreated() && order.status !== OrderStatus.PAYMENT_PENDING) {
        throw new ValidationError(
          'ORDER_NOT_PAYABLE',
          'Payment already initiated for this order',
        );
      }

      const amount = order.grandTotal.toNumber();
      const existingAttempts = await this.paymentRepo.findAllByOrderId(
        order.id,
        tx,
      );
      const attemptNo = existingAttempts.length + 1;

      const payment = Payment.createNew({
        id: uuid(),
        orderId: order.id,
        method: PaymentMethod.ONLINE,
        amount,
        provider: 'RAZORPAY',
      });

      const saved = await this.paymentRepo.create(payment, tx, attemptNo);

      if (order.isCreated()) {
        const pendingOrder = order.markPaymentPending();
        await this.orderRepo.update(pendingOrder, tx);
      }

      return { payment: saved, amount };
    },
  );

  /* ================================================= */
  /* EVENTS                                            */
  /* ================================================= */

  this.paymentEvents.emitPaymentInitiated({
    paymentId: payment.id,
    orderId: payment.orderId,
    amount: payment.amount.toNumber(),
    occurredAt: new Date(),
  });

  /* ================================================= */
  /* PHASE 2 — RAZORPAY ORDER                          */
  /* ================================================= */

  const session = await this.gateway.createPaymentSession({
    orderId: payment.orderId,
    amount,
    currency: 'INR',
  });

  this.logger.log(
    `[Razorpay Order Created] orderId=${payment.orderId} paymentId=${payment.id} razorpayOrderId=${session.providerPaymentId} amount=${amount}`,
  );

  const amountInPaise = Math.round(amount * 100);

  /* ================================================= */
  /* PHASE 3 — SAVE PROVIDER REF                        */
  /* ================================================= */

  const updated = payment.attachProviderRef(
    session.providerPaymentId,
  );

  await this.prisma.$transaction(async (tx) => {
    await this.paymentRepo.update(updated, tx);
  });

  /* ================================================= */
  /* 🔥 FIX #2 → RETURN ORDER ID FOR FRONTEND           */
  /* ================================================= */

  return {
    payment: updated,
    razorpayOrderId: session.providerPaymentId,
    amountInPaise,
    checkoutUrl: session.checkoutUrl ?? null,
  };
}


  /* ================================================= */
  /* CONFIRM PAYMENT (SAFE + IDEMPOTENT)               */
  /* ================================================= */

async confirmPayment(params: {
  paymentId: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
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

  if (payment.isSuccess()) {
    this.logger.log(
      `[Payment Callback] Already verified paymentId=${payment.id} orderId=${payment.orderId}`,
    );
    return payment;
  }

  if (!payment.providerRefId) {
    throw new ValidationError(
      'PROVIDER_REF_MISSING',
      'Provider reference missing',
    );
  }

  const razorpayPaymentId =
    params.razorpayPaymentId ?? payment.transactionId ?? undefined;

  if (!razorpayPaymentId) {
    throw new ValidationError(
      'RAZORPAY_PAYMENT_ID_REQUIRED',
      'Razorpay payment id is required for verification',
    );
  }

  this.logger.log(
    `[Payment Callback] paymentId=${payment.id} orderId=${payment.orderId} razorpayPaymentId=${razorpayPaymentId} razorpayOrderId=${params.razorpayOrderId ?? payment.providerRefId}`,
  );

  const verification = await this.gateway.verifyPayment({
    providerOrderId: params.razorpayOrderId ?? payment.providerRefId,
    providerPaymentId: razorpayPaymentId,
    signature: params.razorpaySignature,
  });

  this.logger.log(
    `[Signature Verification] paymentId=${payment.id} success=${verification.success} reason=${JSON.stringify(verification.raw ?? null)}`,
  );

  /* ================================================= */
  /* DB UPDATE (atomic)                                */
  /* ================================================= */

  const updatedPayment = await this.prisma.$transaction(async (tx) => {

    const freshPayment = await this.paymentRepo.findById(
      payment.id,
      tx,
    );

    if (!freshPayment) {
      throw new ValidationError('PAYMENT_INVALID', 'Invalid payment');
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
  /* EMIT EVENTS ONLY WHEN STATE CHANGED                */
  /* ================================================= */

  if (updatedPayment.isSuccess()) {
    this.logger.log(
      `[Payment Updated] paymentId=${updatedPayment.id} orderId=${updatedPayment.orderId} status=SUCCESS`,
    );
    this.paymentEvents.emitPaymentSuccess({
      paymentId: updatedPayment.id,
      orderId: updatedPayment.orderId,
      amount: updatedPayment.amount.toNumber(),
      transactionId: updatedPayment.transactionId!,
      occurredAt: new Date(),
    });
  } else {
    this.logger.warn(
      `[Payment Updated] paymentId=${updatedPayment.id} orderId=${updatedPayment.orderId} status=FAILED`,
    );
    this.paymentEvents.emitPaymentFailed({
      paymentId: updatedPayment.id,
      orderId: updatedPayment.orderId,
      amount: updatedPayment.amount.toNumber(),
      occurredAt: new Date(),
    });

    throw new ValidationError(
      'PAYMENT_VERIFICATION_FAILED',
      'Payment verification failed',
    );
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
    if (params.signature && typeof params.payload === 'string') {
      this.gateway.verifyWebhookSignature(params.signature, params.payload);
    }

    const body = params.payload as any;
    const event = body?.event as string | undefined;
    const paymentEntity = body?.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id as string | undefined;
    const razorpayPaymentId = paymentEntity?.id as string | undefined;

    const supportedEvents = new Set([
      'payment.authorized',
      'payment.captured',
      'payment.failed',
      'order.paid',
    ]);

    if (event && !supportedEvents.has(event) && !event.startsWith('refund.')) {
      return;
    }

    if (event === 'refund.created' || event === 'refund.processed') {
      this.paymentEvents.emitPaymentRefunded({
        paymentId: razorpayPaymentId ?? '',
        orderId: '',
        amount: Number(paymentEntity?.amount ?? 0) / 100,
        occurredAt: new Date(),
      });
      return;
    }

    if (!razorpayOrderId) {
      return;
    }

    const payment =
      await this.paymentRepo.findByProviderRefId(razorpayOrderId);

    if (!payment) {
      this.logger.warn(
        `[Webhook Ignored] No payment for razorpayOrderId=${razorpayOrderId} event=${event}`,
      );
      return;
    }

    if (payment.isSuccess()) {
      this.logger.log(
        `[Webhook Ignored] Payment already SUCCESS paymentId=${payment.id} event=${event}`,
      );
      return;
    }

    if (event === 'payment.failed') {
      if (payment.isSuccess()) {
        this.logger.log(
          `[Webhook Ignored] Ignoring payment.failed for successful paymentId=${payment.id}`,
        );
        return;
      }

      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason:
            paymentEntity?.error_description ??
            paymentEntity?.error_reason ??
            'Payment failed',
          updatedAt: new Date(),
        },
      });

      this.paymentEvents.emitPaymentFailed({
        paymentId: payment.id,
        orderId: payment.orderId,
        amount: payment.amount.toNumber(),
        occurredAt: new Date(),
      });
      return;
    }

    this.logger.log(
      `[Webhook Applied] event=${event} paymentId=${payment.id} orderId=${payment.orderId}`,
    );

    try {
      await this.confirmPayment({
        paymentId: payment.id,
        razorpayOrderId,
        razorpayPaymentId,
      });
    } catch (confirmErr) {
      this.logger.error(
        `[Webhook Applied] confirmPayment failed paymentId=${payment.id}`,
        confirmErr,
      );
    }
  } catch (err) {
    this.logger.error('[PAYMENT WEBHOOK ERROR]', err);
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
