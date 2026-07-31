import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { mapStoredPaymentStatus } from '../domain/enums/payment-status.enum';
import { Payment } from '../domain/models/payment.model';
import { PaymentMapper } from '../mappers/payment.mapper';

import { ValidationError } from '../../../common/errors';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE (TX SAFE)                                  */
  /* ================================================= */

  async create(
    payment: Payment,
    tx?: PrismaTransaction,
    attemptNo = 1,
  ): Promise<Payment> {
    if (!payment) {
      throw new ValidationError(
        'PAYMENT_REQUIRED',
        'Payment is required',
      );
    }

    if (tx) {
      return this.createInternal(payment, tx, attemptNo);
    }

    return this.prisma.$transaction((trx) =>
      this.createInternal(payment, trx, attemptNo),
    );
  }

  private async createInternal(
    payment: Payment,
    client: PrismaTransaction,
    attemptNo: number,
  ): Promise<Payment> {
    const row = await client.payment.create({
      data: {
        ...PaymentMapper.toPrismaCreate(payment),
        attemptNo,
      },
    });

    return PaymentMapper.toDomain(row);
  }

  /* ================================================= */
  /* READ (BY ID)                                      */
  /* ================================================= */

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<Payment | null> {
    if (!id) return null;

    const row = await (tx ?? this.prisma).payment.findUnique({
      where: { id },
    });

    return row ? PaymentMapper.toDomain(row) : null;
  }

  /* ================================================= */
  /* READ (BY PROVIDER REF ID 🔥 IMPORTANT)             */
  /* Used by webhook + idempotency                     */
  /* ================================================= */

  async findByProviderRefId(
    providerRefId: string,
    tx?: PrismaTransaction,
  ): Promise<Payment | null> {
    if (!providerRefId) return null;

    const row = await (tx ?? this.prisma).payment.findFirst({
      where: { providerRefId },
    });

    return row ? PaymentMapper.toDomain(row) : null;
  }

  /* ================================================= */
  /* READ (LATEST BY ORDER ID)                          */
  /* ================================================= */

  async findLatestByOrderId(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<Payment | null> {
    if (!orderId) return null;

    const row = await (tx ?? this.prisma).payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return row ? PaymentMapper.toDomain(row) : null;
  }

  async findLatestByOrderIds(
    orderIds: string[],
    tx?: PrismaTransaction,
  ): Promise<Map<string, Payment>> {
    const uniqueIds = [...new Set(orderIds.filter(Boolean))];
    const result = new Map<string, Payment>();

    if (uniqueIds.length === 0) {
      return result;
    }

    const rows = await (tx ?? this.prisma).payment.findMany({
      where: { orderId: { in: uniqueIds } },
      orderBy: { createdAt: 'desc' },
    });

    for (const row of rows) {
      if (!result.has(row.orderId)) {
        result.set(row.orderId, PaymentMapper.toDomain(row));
      }
    }

    return result;
  }

  /* ================================================= */
  /* READ (ALL BY ORDER ID)                             */
  /* ================================================= */

  async findAllByOrderId(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<Payment[]> {
    if (!orderId) return [];

    const rows = await (tx ?? this.prisma).payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => PaymentMapper.toDomain(row));
  }

  async findAllForAdmin(params: {
    page: number;
    limit: number;
    status?: string;
    orderId?: string;
  }): Promise<{
    items: Array<{
      id: string;
      orderId: string;
      orderNumber: string | null;
      customerId: string;
      customerName: string | null;
      outletId: string;
      outletName: string | null;
      status: string;
      method: string;
      provider: string | null;
      providerRefId: string | null;
      transactionId: string | null;
      amount: number;
      attemptNo: number;
      failureReason: string | null;
      paidAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: Record<string, unknown> = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.orderId) {
      where.orderId = params.orderId;
    }

    const skip = (params.page - 1) * params.limit;

    const [rows, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              orderNumber: true,
              customerId: true,
              outletId: true,
              customer: {
              select: {
                phone: true,
                profile: { select: { fullName: true } },
              },
            },
              outlet: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        orderId: row.orderId,
        orderNumber: row.order.orderNumber,
        customerId: row.order.customerId,
        customerName: row.order.customer?.profile?.fullName ?? null,
        outletId: row.order.outletId,
        outletName: row.order.outlet?.name ?? null,
        status: mapStoredPaymentStatus(row.status),
        method: row.method,
        provider: row.provider,
        providerRefId: row.providerRefId,
        transactionId: row.transactionId,
        amount: Number(row.amount),
        attemptNo: row.attemptNo,
        failureReason: row.failureReason,
        paidAt: row.paidAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit) || 1,
    };
  }

  async findAdminDetailById(paymentId: string) {
    const row = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerId: true,
            outletId: true,
            cartId: true,
            grandTotal: true,
            status: true,
            customer: {
              select: {
                phone: true,
                profile: { select: { fullName: true } },
              },
            },
            outlet: { select: { name: true } },
          },
        },
      },
    });

    if (!row) {
      return null;
    }

    const attempts = await this.prisma.payment.findMany({
      where: { orderId: row.orderId },
      orderBy: { attemptNo: 'asc' },
    });

    return {
      id: row.id,
      orderId: row.orderId,
      orderNumber: row.order.orderNumber,
      cartId: row.order.cartId,
      customerId: row.order.customerId,
      customerName: row.order.customer?.profile?.fullName ?? null,
      customerPhone: row.order.customer?.phone ?? null,
      outletId: row.order.outletId,
      outletName: row.order.outlet?.name ?? null,
      orderStatus: row.order.status,
      orderGrandTotal: Number(row.order.grandTotal),
      status: row.status,
      method: row.method,
      provider: row.provider,
      providerRefId: row.providerRefId,
      transactionId: row.transactionId,
      amount: Number(row.amount),
      paidAmount: row.paidAmount != null ? Number(row.paidAmount) : null,
      attemptNo: row.attemptNo,
      failureReason: row.failureReason,
      paidAt: row.paidAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      attempts: attempts.map((attempt) => ({
        id: attempt.id,
        attemptNo: attempt.attemptNo,
        status: attempt.status,
        providerRefId: attempt.providerRefId,
        transactionId: attempt.transactionId,
        amount: Number(attempt.amount),
        failureReason: attempt.failureReason,
        paidAt: attempt.paidAt,
        createdAt: attempt.createdAt,
      })),
    };
  }

  /* ================================================= */
  /* UPDATE (TX SAFE)                                  */
  /* ================================================= */

  async update(
    payment: Payment,
    tx?: PrismaTransaction,
  ): Promise<Payment> {
    if (!payment) {
      throw new ValidationError(
        'PAYMENT_REQUIRED',
        'Payment is required',
      );
    }

    if (tx) {
      return this.updateInternal(payment, tx);
    }

    return this.prisma.$transaction((trx) =>
      this.updateInternal(payment, trx),
    );
  }

  private async updateInternal(
    payment: Payment,
    client: PrismaTransaction,
  ): Promise<Payment> {
    const row = await client.payment.update({
      where: { id: payment.id },
      data: PaymentMapper.toPrismaUpdate(payment),
    });

    return PaymentMapper.toDomain(row);
  }

  /* ================================================= */
  /* DELETE                                            */
  /* ================================================= */

  async delete(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    if (!id) return;

    await (tx ?? this.prisma).payment.delete({
      where: { id },
    });
  }
}
