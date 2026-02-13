import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidationError } from '../../../common/errors';

import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  verifyRazorpaySignature,
} from '../../../infrastructure/providers/razorpay/razorpay.client';

/* ================================================= */
/* TYPES                                             */
/* ================================================= */

export interface PaymentSession {
  providerPaymentId: string;
  checkoutUrl: string | null;
}

export interface PaymentVerificationResult {
  success: boolean;
  providerPaymentId: string;
  raw?: unknown;
}
console.log('ENV DEBUG →', process.env.NODE_ENV);

/* ================================================= */
/* GATEWAY SERVICE                                   */
/* ================================================= */

@Injectable()
export class PaymentGatewayService {
  constructor(
    private readonly config: ConfigService, // 🔥 ADD THIS
  ) {}

  /* ================================================= */
  /* CREATE PAYMENT SESSION                            */
  /* ================================================= */

  async createPaymentSession(params: {
    orderId: string;
    amount: number;
    currency: string;
  }): Promise<PaymentSession> {

    if (!params?.orderId) {
      throw new ValidationError('ORDER_ID_REQUIRED', 'Order id is required');
    }

    if (!params.amount || params.amount <= 0) {
      throw new ValidationError('INVALID_AMOUNT', 'Payment amount must be greater than 0');
    }

    const razorpayOrder = await createRazorpayOrder({
      receipt: params.orderId,
      amount: params.amount,
      currency: params.currency,
    });

    return {
      providerPaymentId: razorpayOrder.id,
      checkoutUrl: null,
    };
  }

  /* ================================================= */
  /* VERIFY PAYMENT                                    */
  /* ================================================= */

  async verifyPayment(params: {
    providerPaymentId: string;
  }): Promise<PaymentVerificationResult> {

    console.log('\n==============================');
    console.log('🔍 VERIFY PAYMENT START');
    console.log('providerPaymentId:', params.providerPaymentId);

    /* 🔥 DEBUG BOTH SOURCES */
    console.log('process.env.NODE_ENV =', process.env.NODE_ENV);

    const env = this.config.get<string>('NODE_ENV');
    console.log('ConfigService NODE_ENV =', env);

    console.log('==============================\n');

    if (!params?.providerPaymentId) {
      throw new ValidationError(
        'PROVIDER_PAYMENT_ID_REQUIRED',
        'Provider payment id is required',
      );
    }

    /* ================================================= */
    /* DEV MODE                                          */
    /* ================================================= */

    if (env !== 'production') {
      console.log('⚡ MOCK MODE → auto success\n');

      return {
        success: true,
        providerPaymentId: params.providerPaymentId,
        raw: { mocked: true },
      };
    }

    /* ================================================= */
    /* PRODUCTION MODE                                   */
    /* ================================================= */

    try {
      console.log('🌐 REAL MODE → calling Razorpay verify...');

      const payment = await fetchRazorpayPayment(
        params.providerPaymentId,
      );

      console.log('📡 Razorpay status →', payment.status);

      return {
        success: payment.status === 'captured',
        providerPaymentId: params.providerPaymentId,
        raw: payment,
      };

    } catch (err) {
      console.error('❌ Razorpay verify failed:', err);

      return {
        success: false,
        providerPaymentId: params.providerPaymentId,
      };
    }
  }

  /* ================================================= */
  /* WEBHOOK VERIFY                                    */
  /* ================================================= */

  verifyWebhookSignature(signature?: string, payload?: string | Buffer): void {
    verifyRazorpaySignature({
      signature,
      payload: payload ?? '',
    });
  }
}
