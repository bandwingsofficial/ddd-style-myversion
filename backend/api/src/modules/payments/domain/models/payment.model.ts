import { ValidationError } from '../../../../common/errors';

import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

import { Money } from '../../../orders/domain/value-objects/money.vo';

/* ---------------------------------------------- */
/* PROPS                                          */
/* ---------------------------------------------- */

export interface PaymentProps {
  id: string;

  orderId: string;

  method: PaymentMethod;
  status: PaymentStatus;

  provider?: string;
  providerRefId?: string;
  transactionId?: string;

  amount: Money;

  paidAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

/* ---------------------------------------------- */
/* ENTITY (AGGREGATE ROOT STYLE)                  */
/* ---------------------------------------------- */

export class Payment {
  readonly id: string;

  readonly orderId: string;

  readonly method: PaymentMethod;
  readonly status: PaymentStatus;

  readonly provider?: string;
  readonly providerRefId?: string;
  readonly transactionId?: string;

  readonly amount: Money;

  readonly paidAt?: Date;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  /* ---------------------------------------------- */
  /* CONSTRUCTOR                                    */
  /* ---------------------------------------------- */

  private constructor(props: PaymentProps) {
    Object.assign(this, props);

    this.assertValidState();

    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    orderId: string;

    method: PaymentMethod;

    amount: number;

    provider?: string;
    providerRefId?: string;

    now?: Date;
  }): Payment {
    const now = params.now ?? new Date();

    return new Payment({
      id: params.id,
      orderId: params.orderId,

      method: params.method,
      status: PaymentStatus.INITIATED,

      provider: params.provider,
      providerRefId: params.providerRefId,

      amount: Money.create(params.amount),

      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: PaymentProps): Payment {
    return new Payment(props);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isInitiated(): boolean {
    return this.status === PaymentStatus.INITIATED;
  }

  isSuccess(): boolean {
    return this.status === PaymentStatus.SUCCESS;
  }

  isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  isRefunded(): boolean {
    return this.status === PaymentStatus.REFUNDED;
  }

  /**
   * Final but NOT success
   */
  isFinal(): boolean {
    return [PaymentStatus.FAILED, PaymentStatus.REFUNDED].includes(
      this.status,
    );
  }

  /**
   * 🔥 NEW
   * Used for idempotency
   * SUCCESS or FAILED or REFUNDED
   */
  isCompleted(): boolean {
    return [
      PaymentStatus.SUCCESS,
      PaymentStatus.FAILED,
      PaymentStatus.REFUNDED,
    ].includes(this.status);
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                              */
  /* ---------------------------------------------- */

  /**
   * 🔥 NEW
   * Attach provider reference after session creation
   */
  attachProviderRef(
    providerRefId: string,
    now = new Date(),
  ): Payment {
    if (!providerRefId) {
      throw new ValidationError(
        'PROVIDER_REF_REQUIRED',
        'Provider reference id is required',
      );
    }

    return new Payment({
      ...this,
      providerRefId,
      updatedAt: now,
    });
  }

  markSuccess(params: {
    transactionId: string;
    now?: Date;
  }): Payment {
    if (!this.isInitiated()) {
      throw new ValidationError(
        'INVALID_TRANSITION',
        'Only initiated payments can succeed',
      );
    }

    if (!params.transactionId) {
      throw new ValidationError(
        'PAYMENT_TX_REQUIRED',
        'Transaction id is required',
      );
    }

    const now = params.now ?? new Date();

    return new Payment({
      ...this,
      status: PaymentStatus.SUCCESS,
      transactionId: params.transactionId,
      paidAt: now,
      updatedAt: now,
    });
  }

  markFailed(now = new Date()): Payment {
    if (!this.isInitiated()) {
      throw new ValidationError(
        'INVALID_TRANSITION',
        'Only initiated payments can fail',
      );
    }

    return new Payment({
      ...this,
      status: PaymentStatus.FAILED,
      updatedAt: now,
    });
  }

  markRefunded(now = new Date()): Payment {
    if (!this.isSuccess()) {
      throw new ValidationError(
        'REFUND_NOT_ALLOWED',
        'Only successful payments can be refunded',
      );
    }

    return new Payment({
      ...this,
      status: PaymentStatus.REFUNDED,
      updatedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* INVARIANTS                                     */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (!this.orderId) {
      throw new ValidationError(
        'PAYMENT_INVALID_ORDER',
        'Order is required for payment',
      );
    }

    if (!this.amount || this.amount.isZero()) {
      throw new ValidationError(
        'PAYMENT_INVALID_AMOUNT',
        'Payment amount must be greater than zero',
      );
    }
  }
}
