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
/* ================================================= */

@Injectable()
export class PaymentGatewayService {
  /* ================================================= */
  /* INTERNAL: SAFE WRAPPER                            */
  /* Prevent hanging / crashing calls                  */
  /* ================================================= */

  private async withTimeout<T>(
    promise: Promise<T>,
    ms = 8000,
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new ValidationError(
              'PAYMENT_GATEWAY_TIMEOUT',
              'Payment provider timeout',
            ),
          ),
        ms,
      ),
    );

    return Promise.race([promise, timeout]);
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

    /* ---------- validation ---------- */

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
      /**
       * 🔥 MOCK IMPLEMENTATION
       * Replace with Stripe/Razorpay later
       */

      return await this.withTimeout(
        Promise.resolve({
          providerPaymentId: `PAY_${uuid()}`,
          checkoutUrl: `https://fake-payments.local/checkout/PAY_${uuid()}`,
        }),
      );
    } catch (err) {
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
      /**
       * 🔥 MOCK
       */

      return await this.withTimeout(
        Promise.resolve({
          success: true,
          providerPaymentId: params.providerPaymentId,
          raw: {},
        }),
      );
    } catch {
      return {
        success: false,
        providerPaymentId: params.providerPaymentId,
      };
    }
  }
}
