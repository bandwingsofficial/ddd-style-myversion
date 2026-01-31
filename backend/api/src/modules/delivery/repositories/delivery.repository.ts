import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Delivery } from '../domain/models/delivery.model';
import { DeliveryMapper } from '../mappers/delivery.mapper';

@Injectable()
export class DeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE (TX SAFE)                                  */
  /* ================================================= */

  async create(
    delivery: Delivery,
    tx?: PrismaTransaction,
  ): Promise<Delivery> {
    if (tx) {
      return this.createInternal(delivery, tx);
    }

    return this.prisma.$transaction((trx) =>
      this.createInternal(delivery, trx),
    );
  }

  private async createInternal(
    delivery: Delivery,
    client: PrismaTransaction,
  ): Promise<Delivery> {
    const row = await client.delivery.create({
      data: DeliveryMapper.toPrismaCreate(delivery),
    });

    return DeliveryMapper.toDomain(row);
  }

  /* ================================================= */
  /* READ (BY ID)                                      */
  /* ================================================= */

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<Delivery | null> {
    const row = await (tx ?? this.prisma).delivery.findUnique({
      where: { id },
    });

    return row ? DeliveryMapper.toDomain(row) : null;
  }

  /* ================================================= */
  /* READ (BY ORDER ID)                                */
  /* 1 delivery per order                              */
  /* ================================================= */

  async findByOrderId(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<Delivery | null> {
    const row = await (tx ?? this.prisma).delivery.findUnique({
      where: { orderId },
    });

    return row ? DeliveryMapper.toDomain(row) : null;
  }

  /* ================================================= */
  /* READ (BY PARTNER ID)                              */
  /* rider app listing                                 */
  /* ================================================= */

  async findAllByPartner(
    partnerId: string,
    tx?: PrismaTransaction,
  ): Promise<Delivery[]> {
    const rows = await (tx ?? this.prisma).delivery.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => DeliveryMapper.toDomain(row));
  }

  /* ================================================= */
  /* UPDATE (STATUS ONLY — no version locking)          */
  /* ================================================= */

  async update(
    delivery: Delivery,
    tx?: PrismaTransaction,
  ): Promise<Delivery> {
    const client = tx ?? this.prisma;

    const row = await client.delivery.update({
      where: { id: delivery.id },
      data: DeliveryMapper.toPrismaUpdate(delivery),
    });

    return DeliveryMapper.toDomain(row);
  }

  /* ================================================= */
  /* DELETE                                            */
  /* ================================================= */

  async delete(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    await (tx ?? this.prisma).delivery.delete({
      where: { id },
    });
  }
}
