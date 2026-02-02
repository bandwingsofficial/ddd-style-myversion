import { Injectable } from '@nestjs/common';
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
  providerPaymentId: string; // razorpay order id
  checkoutUrl: string | null;
}

export interface PaymentVerificationResult {
  success: boolean;
  providerPaymentId: string;
  raw?: unknown;
}

/* ================================================= */
/* GATEWAY SERVICE (REAL RAZORPAY)                   */
/* ================================================= */

@Injectable()
export class PaymentGatewayService {
  /* ================================================= */
  /* CREATE PAYMENT SESSION                            */
  /* ================================================= */

  async createPaymentSession(params: {
    orderId: string;
    amount: number;
    currency: string;
  }): Promise<PaymentSession> {



    if (!params?.orderId) {
      throw new ValidationError(
        'ORDER_ID_REQUIRED',
        'Order id is required',
      );
    }

    if (!params.amount || params.amount <= 0) {
      throw new ValidationError(
        'INVALID_AMOUNT',
        'Payment amount must be greater than 0',
      );
    }

    try {
      /* ---------------------------------------------- */
      /* 🔥 REAL RAZORPAY ORDER                         */
      /* ---------------------------------------------- */

      const razorpayOrder = await createRazorpayOrder({
        receipt: params.orderId,
        amount: params.amount,
        currency: params.currency,
      });

      return {
        providerPaymentId: razorpayOrder.id, // 👈 important
        checkoutUrl: null, // Razorpay uses frontend SDK
      };
    } catch (err) {
      console.error('[PAYMENT GATEWAY] Razorpay order failed:', err);

      throw new ValidationError(
        'PAYMENT_GATEWAY_FAILED',
        'Failed to create payment session',
      );
    }
  }

  /* ================================================= */
  /* VERIFY PAYMENT                                    */
  /* ================================================= */

  async verifyPayment(params: {
    providerPaymentId: string;
  }): Promise<PaymentVerificationResult> {
    if (!params?.providerPaymentId) {
      throw new ValidationError(
        'PROVIDER_PAYMENT_ID_REQUIRED',
        'Provider payment id is required',
      );
    }

    try {
      const payment = await fetchRazorpayPayment(
        params.providerPaymentId,
      );

      return {
        success: payment.status === 'captured',
        providerPaymentId: params.providerPaymentId,
        raw: payment,
      };
    } catch (err) {
      console.error('[PAYMENT GATEWAY] verify failed:', err);

      return {
        success: false,
        providerPaymentId: params.providerPaymentId,
      };
    }
  }

  /* ================================================= */
  /* WEBHOOK VERIFY                                    */
  /* ================================================= */

  verifyWebhookSignature(
    signature?: string,
    payload?: string | Buffer,
  ): void {
    verifyRazorpaySignature({
      signature,
      payload: payload ?? '',
    });
  }
}
