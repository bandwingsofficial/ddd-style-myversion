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

async createPayment(params: {
  orderId: string;
}): Promise<{
  payment: Payment;
  checkoutUrl: string;
}> {

  console.log('\n💳 ==============================');
  console.log('CREATE PAYMENT SESSION START');
  console.log('orderId:', params.orderId);
  console.log('==============================\n');

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

      console.log('🛢️  [DB] Fetching order...');

      const order = await this.orderRepo.findById(params.orderId, tx);

      if (!order) {
        throw new ValidationError('ORDER_NOT_FOUND', 'Order not found');
      }

      if (!order.isCreated()) {
        console.log('❌ Order not payable');
        throw new ValidationError(
          'ORDER_NOT_PAYABLE',
          'Payment already initiated for this order',
        );
      }

      const amount = order.grandTotal.toNumber();

      console.log('🟡 Creating payment record...');
      console.log({ amount });

      const payment = Payment.createNew({
        id: uuid(),
        orderId: order.id,
        method: PaymentMethod.ONLINE,
        amount,
        provider: 'MOCK_GATEWAY',
      });

      const saved = await this.paymentRepo.create(payment, tx);

      console.log('🔄 Marking order → PAYMENT_PENDING');

      const pendingOrder = order.markPaymentPending();
      await this.orderRepo.update(pendingOrder, tx);

      return { payment: saved, amount };
    },
  );

  console.log('✅ DB COMMIT COMPLETE');
  console.log({
    paymentId: payment.id,
    orderId: payment.orderId,
    status: 'PAYMENT_PENDING',
  });

  /* ================================================= */
  /* 🔥 EMIT AFTER COMMIT                               */
  /* ================================================= */

  this.paymentEvents.emitPaymentInitiated({
    paymentId: payment.id,
    orderId: payment.orderId,
    amount: payment.amount.toNumber(),
    occurredAt: new Date(),
  });

  /* ================================================= */
  /* PHASE 2 — EXTERNAL (Razorpay)                     */
  /* ================================================= */

  console.log('🌐 Calling Razorpay → create order...');

  const session = await this.gateway.createPaymentSession({
    orderId: payment.orderId,
    amount,
    currency: 'INR',
  });

  console.log('✅ Razorpay order created');
  console.log({
    providerOrderId: session.providerPaymentId,
  });

  /* ================================================= */
  /* PHASE 3 — SAVE PROVIDER REF                        */
  /* ================================================= */

  const updated = payment.attachProviderRef(
    session.providerPaymentId,
  );

  await this.prisma.$transaction(async (tx) => {
    await this.paymentRepo.update(updated, tx);
  });

  console.log('🔗 Provider reference saved to DB');
  console.log({
    paymentId: updated.id,
    providerRef: updated.providerRefId,
  });

  console.log('💳 CREATE PAYMENT SESSION END\n');

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

  console.log('\n💰 ==============================');
  console.log('CONFIRM PAYMENT START');
  console.log('paymentId:', params.paymentId);
  console.log('==============================\n');

  if (!params?.paymentId) {
    throw new ValidationError(
      'PAYMENT_ID_REQUIRED',
      'Payment id is required',
    );
  }

  console.log('🛢️  Fetching payment from DB...');

  const payment = await this.paymentRepo.findById(params.paymentId);

  if (!payment) {
    throw new ValidationError(
      'PAYMENT_NOT_FOUND',
      'Payment not found',
    );
  }

  console.log('✅ Payment found');
  console.log({
    providerRefId: payment.providerRefId,
    currentStatus: payment.status,
  });

  /* 🔥 HARD IDEMPOTENCY EXIT */
  if (payment.isSuccess()) {
    console.log('🟡 Already SUCCESS — skipping confirm completely\n');
    return payment;
  }

  if (!payment.providerRefId) {
    throw new ValidationError(
      'PROVIDER_REF_MISSING',
      'Provider reference missing',
    );
  }

  /* ================================================= */
  /* EXTERNAL VERIFY                                   */
  /* ================================================= */

  console.log('🌐 Verifying payment with gateway...');

  const verification = await this.gateway.verifyPayment({
    providerPaymentId: payment.providerRefId,
  });

  console.log('📡 Gateway verification result →');
  console.log(verification);

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
      console.log('🟢 SUCCESS → marking PAID');
      newPayment = freshPayment.markSuccess({
        transactionId: verification.providerPaymentId,
      });
    } else {
      console.log('🔴 FAILED → marking FAILED');
      newPayment = freshPayment.markFailed();
    }

    await this.paymentRepo.update(newPayment, tx);

    return newPayment;
  });

  /* ================================================= */
  /* EMIT EVENTS ONLY WHEN STATE CHANGED                */
  /* ================================================= */

  if (updatedPayment.isSuccess()) {
    console.log('🎉 Emitting PaymentSuccess event');

    this.paymentEvents.emitPaymentSuccess({
      paymentId: updatedPayment.id,
      orderId: updatedPayment.orderId,
      amount: updatedPayment.amount.toNumber(),
      transactionId: updatedPayment.transactionId!,
      occurredAt: new Date(),
    });
  } else {
    console.log('⚠️ Emitting PaymentFailed event');

    this.paymentEvents.emitPaymentFailed({
      paymentId: updatedPayment.id,
      orderId: updatedPayment.orderId,
      amount: updatedPayment.amount.toNumber(),
      occurredAt: new Date(),
    });
  }

  console.log('💰 CONFIRM PAYMENT END\n');

  return updatedPayment;
}

  /* ================================================= */
/* WEBHOOK (FAST + SAFE)                             */
/* ================================================= */

async handleWebhook(params: {
  payload: unknown;
  signature?: string;
}): Promise<void> {

  console.log('\n📩 ==============================');
  console.log('WEBHOOK RECEIVED');
  console.log('==============================');

  try {

    /* ---------------------------------------------- */
    /* 🔐 signature verify (optional)                  */
    /* ---------------------------------------------- */

    // this.gateway.verifyWebhookSignature(
    //   params.signature,
    //   params.payload,
    // );

    console.log('📦 Raw payload →');
    console.log(JSON.stringify(params.payload, null, 2));

    /* ---------------------------------------------- */
    /* ✅ Razorpay correct parsing                     */
    /* ---------------------------------------------- */

    const body = params.payload as any;

    const providerPaymentId =
      body?.payload?.payment?.entity?.id;

    console.log('🔍 Extracted providerPaymentId:', providerPaymentId);

    if (!providerPaymentId) {
      console.log('⚠️ No providerPaymentId found → ignoring');
      return;
    }

    /* ---------------------------------------------- */
    /* find payment                                   */
    /* ---------------------------------------------- */

    console.log('🛢️ Looking up payment in DB...');

    const payment =
      await this.paymentRepo.findByProviderRefId(
        providerPaymentId,
      );

    if (!payment) {
      console.log('⚠️ Payment not found for providerRef');
      return;
    }

    console.log('✅ Payment found → confirming...');
    console.log({
      paymentId: payment.id,
      orderId: payment.orderId,
    });

    /* ---------------------------------------------- */
    /* idempotent confirm                              */
    /* ---------------------------------------------- */

    await this.confirmPayment({
      paymentId: payment.id,
    });

    console.log('🎉 Webhook processing complete\n');

  } catch (err) {

    /* 🔥 NEVER throw in webhook */
    console.error('❌ [PAYMENT WEBHOOK ERROR]');
    console.error(err);
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
