// src/modules/payments/mappers/payment.mapper.ts

import {
  Payment as PrismaPayment,
  PaymentStatus as PrismaPaymentStatus,
  PaymentMethod as PrismaPaymentMethod,
  Prisma,
} from '@prisma/client';

import { Payment } from '../domain/models/payment.model';

import { PaymentStatus } from '../domain/enums/payment-status.enum';
import { PaymentMethod } from '../domain/enums/payment-method.enum';

import { Money } from '../../orders/domain/value-objects/money.vo';

/* ---------------------------------------------- */
/* MAPPER                                         */
/* ---------------------------------------------- */

export class PaymentMapper {
  /* ---------------------------------------------- */
  /* TO DOMAIN                                      */
  /* ---------------------------------------------- */

  static toDomain(row: PrismaPayment): Payment {
    return Payment.rehydrate({
      id: row.id,

      orderId: row.orderId,

      method: this.toDomainMethod(row.method),
      status: this.toDomainStatus(row.status),

      provider: row.provider ?? undefined,
      providerRefId: row.providerRefId ?? undefined,
      transactionId: row.transactionId ?? undefined,

      // cents safe
      amount: Money.fromCents(Number(row.amount)),

      paidAt: row.paidAt ?? undefined,

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  /* ---------------------------------------------- */
  /* TO PRISMA (CREATE)                             */
  /* ---------------------------------------------- */

  static toPrismaCreate(payment: Payment): Prisma.PaymentCreateInput {
    return {
      id: payment.id,

      order: {
        connect: { id: payment.orderId },
      },

      method: this.toPrismaMethod(payment.method),
      status: this.toPrismaStatus(payment.status),

      provider: payment.provider,
      providerRefId: payment.providerRefId,
      transactionId: payment.transactionId,

      amount: payment.amount.toCents(),

      paidAt: payment.paidAt ?? null,

      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  /* ---------------------------------------------- */
  /* TO PRISMA (UPDATE)                             */
  /* ---------------------------------------------- */

  static toPrismaUpdate(payment: Payment): Prisma.PaymentUpdateInput {
    return {
      method: this.toPrismaMethod(payment.method),
      status: this.toPrismaStatus(payment.status),

      provider: payment.provider,
      providerRefId: payment.providerRefId,
      transactionId: payment.transactionId,

      amount: payment.amount.toCents(),

      paidAt: payment.paidAt ?? null,

      updatedAt: payment.updatedAt,
    };
  }

  /* ---------------------------------------------- */
  /* ENUM MAPPING                                   */
  /* ---------------------------------------------- */

  /* -------- STATUS -------- */

  private static toDomainStatus(
    status: PrismaPaymentStatus,
  ): PaymentStatus {
    switch (status) {
      case PrismaPaymentStatus.INITIATED:
        return PaymentStatus.INITIATED;

      case PrismaPaymentStatus.SUCCESS:
        return PaymentStatus.SUCCESS;

      case PrismaPaymentStatus.FAILED:
        return PaymentStatus.FAILED;

      case PrismaPaymentStatus.REFUNDED:
        return PaymentStatus.REFUNDED;

      default:
        throw new Error(`Unknown Prisma PaymentStatus: ${status}`);
    }
  }

  private static toPrismaStatus(
    status: PaymentStatus,
  ): PrismaPaymentStatus {
    switch (status) {
      case PaymentStatus.INITIATED:
        return PrismaPaymentStatus.INITIATED;

      case PaymentStatus.SUCCESS:
        return PrismaPaymentStatus.SUCCESS;

      case PaymentStatus.FAILED:
        return PrismaPaymentStatus.FAILED;

      case PaymentStatus.REFUNDED:
        return PrismaPaymentStatus.REFUNDED;

      default:
        throw new Error(`Unknown Domain PaymentStatus: ${status}`);
    }
  }

  /* -------- METHOD -------- */

  private static toDomainMethod(
    method: PrismaPaymentMethod,
  ): PaymentMethod {
    switch (method) {
      case PrismaPaymentMethod.ONLINE:
        return PaymentMethod.ONLINE;

      case PrismaPaymentMethod.COD:
        return PaymentMethod.COD;

      default:
        throw new Error(`Unknown Prisma PaymentMethod: ${method}`);
    }
  }

  private static toPrismaMethod(
    method: PaymentMethod,
  ): PrismaPaymentMethod {
    switch (method) {
      case PaymentMethod.ONLINE:
        return PrismaPaymentMethod.ONLINE;

      case PaymentMethod.COD:
        return PrismaPaymentMethod.COD;

      default:
        throw new Error(`Unknown Domain PaymentMethod: ${method}`);
    }
  }
}
