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
      where: {
        outletId,
        status: {
          notIn: ['CREATED', 'PAYMENT_PENDING'],
        },
      },
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

  /* ================================================= */
  /* ADMIN READS                                       */
  /* ================================================= */

  async findAllForAdmin(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    const where: Record<string, unknown> = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.search?.trim()) {
      const term = params.search.trim();
      where.OR = [
        { orderNumber: { contains: term, mode: 'insensitive' } },
        {
          customer: {
            profile: {
              fullName: { contains: term, mode: 'insensitive' },
            },
          },
        },
        { customer: { phone: { contains: term } } },
      ];
    }

    const skip = (params.page - 1) * params.limit;

    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              phone: true,
              profile: { select: { fullName: true } },
            },
          },
          outlet: { select: { name: true } },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { status: true },
          },
          items: { select: { id: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        orderNumber: row.orderNumber,
        customerName: row.customer.profile?.fullName ?? 'Customer',
        customerPhone: row.customer.phone,
        outletName: row.outlet.name,
        itemCount: row.items.length,
        paymentStatus: row.payments[0]?.status ?? 'INITIATED',
        orderStatus: row.status,
        amount: Number(row.grandTotal),
        createdAt: row.createdAt,
      })),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit) || 1,
    };
  }

  async findAdminDetailRow(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: {
          include: { profile: true },
        },
        outlet: { select: { id: true, name: true } },
        payments: { orderBy: { createdAt: 'desc' } },
        events: { orderBy: { createdAt: 'asc' } },
      },
    });
  }
}
