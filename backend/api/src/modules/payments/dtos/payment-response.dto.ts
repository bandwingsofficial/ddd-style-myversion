import { Payment } from '../domain/models/payment.model';

export class PaymentResponseDto {
  id: string;
  orderId: string;

  status: string;
  method: string;

  provider?: string;
  providerRefId?: string;
  transactionId?: string;

  amount: number;

  paidAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  static fromDomain(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      orderId: payment.orderId,

      status: payment.status,
      method: payment.method,

      provider: payment.provider,
      providerRefId: payment.providerRefId,
      transactionId: payment.transactionId,

      amount: payment.amount.toNumber(),

      paidAt: payment.paidAt,

      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
