import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { ValidationError } from '../../../common/errors';

/* ================================================= */
/* TYPES                                             */
/* ================================================= */

export interface PaymentSession {
  providerPaymentId: string;
  checkoutUrl: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  providerPaymentId: string;
  raw?: unknown;
}

/* ================================================= */
/* GATEWAY SERVICE                                   */
/* External integration ONLY                         */
/* NEVER emits events / NEVER touches DB              */
/* ================================================= */

@Injectable()
export class PaymentGatewayService {

  /* ================================================= */
  /* INTERNAL: SAFE WRAPPER (no timer leak 🔥)         */
  /* ================================================= */

  private async withTimeout<T>(
    promise: Promise<T>,
    ms = 8000,
  ): Promise<T> {

    let timer: NodeJS.Timeout;

    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(
          new ValidationError(
            'PAYMENT_GATEWAY_TIMEOUT',
            'Payment provider timeout',
          ),
        );
      }, ms);
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer!); // 🔥 cleanup
    }
  }

  /* ================================================= */
  /* CREATE PAYMENT SESSION                            */
  /* ================================================= */

  async createPaymentSession(params: {
    orderId: string;
    amount: number;
    currency: string;
    metadata?: Record<string, string>;
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

    if (!params.currency) {
      throw new ValidationError(
        'CURRENCY_REQUIRED',
        'Currency is required',
      );
    }

    try {
      /* ---------------------------------------------- */
      /* 🔥 MOCK PROVIDER (replace with Stripe/Razorpay) */
      /* ---------------------------------------------- */

      const providerPaymentId = `PAY_${uuid()}`;

      return await this.withTimeout(
        Promise.resolve({
          providerPaymentId,
          checkoutUrl: `https://fake-payments.local/checkout/${providerPaymentId}`,
        }),
      );

    } catch (err) {
      console.error(
        '[PAYMENT GATEWAY] createPaymentSession failed:',
        err,
      );

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
      /* ---------------------------------------------- */
      /* 🔥 MOCK VERIFY                                 */
      /* Replace with real provider API call             */
      /* ---------------------------------------------- */

      return await this.withTimeout(
        Promise.resolve({
          success: true,
          providerPaymentId: params.providerPaymentId,
          raw: {},
        }),
      );

    } catch (err) {
      console.error(
        '[PAYMENT GATEWAY] verifyPayment failed:',
        err,
      );

      return {
        success: false,
        providerPaymentId: params.providerPaymentId,
      };
    }
  }

  /* ================================================= */
  /* WEBHOOK SIGNATURE VERIFY (future proof 🔥)        */
  /* ================================================= */

  verifyWebhookSignature(
    signature?: string,
    payload?: unknown,
  ): void {

    // 🔥 MOCK — always pass
    // Later:
    // Stripe → constructEvent(rawBody, signature, secret)
    // Razorpay → crypto HMAC verify

    if (!signature) return;

    // example:
    // if (!isValid(signature)) throw new ValidationError(...)
  }
}
