import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidationError } from '../../../common/errors';

import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  verifyRazorpaySignature,
  verifyRazorpayCheckoutSignature,
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
    providerOrderId: string;
    providerPaymentId: string;
    signature?: string;
  }): Promise<PaymentVerificationResult> {

    if (!params?.providerOrderId || !params?.providerPaymentId) {
      throw new ValidationError(
        'PROVIDER_PAYMENT_ID_REQUIRED',
        'Provider payment id is required',
      );
    }

    const env = this.config.get<string>('NODE_ENV');

    if (env !== 'production') {
      return {
        success: true,
        providerPaymentId: params.providerPaymentId,
        raw: { mocked: true },
      };
    }

    if (
      params.signature &&
      !verifyRazorpayCheckoutSignature({
        orderId: params.providerOrderId,
        paymentId: params.providerPaymentId,
        signature: params.signature,
      })
    ) {
      return {
        success: false,
        providerPaymentId: params.providerPaymentId,
        raw: { reason: 'INVALID_SIGNATURE' },
      };
    }

    try {
      const payment = await fetchRazorpayPayment(params.providerPaymentId);

      return {
        success: payment.status === 'captured' || payment.status === 'authorized',
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
