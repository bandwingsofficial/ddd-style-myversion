import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OrderItem } from '../domain/models/order-item.model';
import { Money } from '../domain/value-objects/money.vo';

@Injectable()
export class OrderItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* BULK CREATE (SAFE – transactional)                */
  /* ================================================= */

  async createMany(
  items: OrderItem[],
  tx?: PrismaTransaction,
): Promise<OrderItem[]> {

  const client = tx ?? this.prisma;

  await client.orderItem.createMany({
    data: items.map(item => ({
      id: item.id,
      orderId: item.orderId,

      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,

      quantity: item.quantity,

      unitPrice: item.unitPrice.toNumber(),
      discountPrice: item.discountPrice?.toNumber(),
      totalPrice: item.totalPrice.toNumber(),

      createdAt: item.createdAt,
    })),
  });

  return items;
}
  /* ================================================= */
  /* READ (BY ORDER)                                  */
  /* ================================================= */

  async findByOrderId(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<OrderItem[]> {
    const rows = await (tx ?? this.prisma).orderItem.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) =>
      OrderItem.rehydrate({
        id: row.id,
        orderId: row.orderId,

        productId: row.productId,
        productName: row.productName,
        productImage: row.productImage,

        quantity: row.quantity,

        unitPrice: Money.create(Number(row.unitPrice)),
        discountPrice: row.discountPrice
          ? Money.create(Number(row.discountPrice))
          : undefined,

        totalPrice: Money.create(Number(row.totalPrice)),

        createdAt: row.createdAt,
      }),
    );
  }

  /* ================================================= */
  /* DELETE                                           */
  /* ================================================= */

  async deleteByOrderId(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    await (tx ?? this.prisma).orderItem.deleteMany({
      where: { orderId },
    });
  }
}
