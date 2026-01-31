import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Order } from '../domain/models/order.model';

import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE (ALWAYS TRANSACTION SAFE)                  */
  /* ================================================= */

  async create(
    order: Order,
    tx?: PrismaTransaction,
  ): Promise<Order> {
    if (tx) {
      return this.createInternal(order, tx);
    }

    // auto wrap in transaction for safety
    return this.prisma.$transaction((trx) =>
      this.createInternal(order, trx),
    );
  }

  private async createInternal(
    order: Order,
    client: PrismaTransaction,
  ): Promise<Order> {
    const row = await client.order.create({
      data: OrderMapper.toPrismaCreate(order),
      include: {
        items: true,
      },
    });

    return OrderMapper.toDomain(row);
  }

  /* ================================================= */
  /* READ (BY ID)                                     */
  /* ================================================= */

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<Order | null> {
    const row = await (tx ?? this.prisma).order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    return row ? OrderMapper.toDomain(row) : null;
  }

  
  /* ================================================= */
  /* READ (BY ID)                                     */
  /* ================================================= */

  async findByOutlet(
    outletId: string,
    tx?: PrismaTransaction,
  ): Promise<Order[]> {
    const rows = await (tx ?? this.prisma).order.findMany({
      where: { outletId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rows.map((row) => OrderMapper.toDomain(row));
  }
  
  /* ================================================= */
  /* READ (BY CUSTOMER)                               */
  /* ================================================= */

  async findAllByCustomer(
    customerId: string,
    tx?: PrismaTransaction,
  ): Promise<Order[]> {
    const rows = await (tx ?? this.prisma).order.findMany({
      where: { customerId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rows.map((row) => OrderMapper.toDomain(row));
  }

  /* ================================================= */
  /* UPDATE (STATUS ONLY)                             */
  /* ================================================= */

  async update(
  order: Order,
  tx?: PrismaTransaction,
): Promise<Order> {
  const client = tx ?? this.prisma;

  const result = await client.order.updateMany({
    where: {
      id: { equals: order.id },
      version: { equals: order.version - 1 },
    },
    data: {
      status: OrderMapper.toPrismaStatus(order.status),
      version: order.version,
      updatedAt: order.updatedAt,
    },
  });

  if (result.count === 0) {
    throw new Error('ORDER_CONCURRENCY_CONFLICT');
  }

  return order;
}

  /* ================================================= */
  /* DELETE                                           */
  /* ================================================= */

  async delete(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    await (tx ?? this.prisma).order.delete({
      where: { id },
    });
  }
}
