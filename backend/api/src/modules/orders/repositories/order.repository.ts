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

    return this.prisma.$transaction((trx) =>
      this.createInternal(order, trx),
    );
  }

  private async createInternal(
    order: Order,
    client: PrismaTransaction,
  ): Promise<Order> {

    /* ------------------------------------------------- */
    /* 1️⃣ CREATE (DB generates orderSequence)            */
    /* ------------------------------------------------- */

    const created = await client.order.create({
      data: OrderMapper.toPrismaCreate(order),
      include: {
        items: true,
        customer: {
          include: {
            profile: true,
          },
        },
      },
    });

    /* ------------------------------------------------- */
    /* 2️⃣ BUILD FORMATTED ORDER NUMBER                   */
    /* ------------------------------------------------- */

    const datePart = created.createdAt
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');

    const formattedOrderNumber = `CNT-${datePart}-${String(
      created.orderSequence,
    ).padStart(5, '0')}`;

    /* ------------------------------------------------- */
    /* 3️⃣ UPDATE WITH FORMATTED NUMBER                  */
    /* ------------------------------------------------- */

    const updated = await client.order.update({
      where: { id: created.id },
      data: {
        orderNumber: formattedOrderNumber,
      },
      include: {
        items: true,
        customer: {
          include: {
            profile: true,
          },
        },
      },
    });

    /* ------------------------------------------------- */
    /* 4️⃣ RETURN DOMAIN                                 */
    /* ------------------------------------------------- */

    return OrderMapper.toDomain(updated);
  }

  /* ================================================= */
  /* READ (BY ID)                                      */
  /* ================================================= */

async findById(
  id: string,
  tx?: PrismaTransaction,
): Promise<Order | null> {
  const row = await (tx ?? this.prisma).order.findUnique({
    where: { id },
    include: {
      items: true,
      customer: {
        include: {
          profile: true,
        },
      },
    },
  });

  return row ? OrderMapper.toDomain(row) : null;
}

  /* ================================================= */
  /* READ (BY OUTLET)                                  */
  /* ================================================= */

  async findByOutlet(
    outletId: string,
    tx?: PrismaTransaction,
  ): Promise<Order[]> {
    const rows = await (tx ?? this.prisma).order.findMany({
      where: { outletId },
      include: {
        items: true,
        customer: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rows.map((row) => OrderMapper.toDomain(row));
  }

  /* ================================================= */
  /* READ (BY CUSTOMER)                                */
  /* ================================================= */

  async findAllByCustomer(
    customerId: string,
    tx?: PrismaTransaction,
  ): Promise<Order[]> {
    const rows = await (tx ?? this.prisma).order.findMany({
      where: { customerId },
      include: {
        items: true,
        customer: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rows.map((row) => OrderMapper.toDomain(row));
  }

  /* ================================================= */
  /* UPDATE (OPTIMISTIC LOCKING)                       */
  /* ================================================= */

  async update(
    order: Order,
    tx?: PrismaTransaction,
  ): Promise<Order> {
    const client = tx ?? this.prisma;

    const result = await client.order.updateMany({
      where: {
        id: order.id,
        version: order.version - 1,
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
  /* DELETE                                            */
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
