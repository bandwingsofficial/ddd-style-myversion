import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

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
  ): Promise<Payment> {
    if (!payment) {
      throw new ValidationError(
        'PAYMENT_REQUIRED',
        'Payment is required',
      );
    }

    if (tx) {
      return this.createInternal(payment, tx);
    }

    return this.prisma.$transaction((trx) =>
      this.createInternal(payment, trx),
    );
  }

  private async createInternal(
    payment: Payment,
    client: PrismaTransaction,
  ): Promise<Payment> {
    const row = await client.payment.create({
      data: PaymentMapper.toPrismaCreate(payment),
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
