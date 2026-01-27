import { Injectable } from '@nestjs/common';

import { OrderRepository } from '../repositories/order.repository';
import { Order } from '../domain/models/order.model';

import { ValidationError } from '../../../common/errors';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

@Injectable()
export class OrderStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderRepo: OrderRepository,
  ) {}

  /* ================================================= */
  /* GENERIC TRANSITION WRAPPER (TX SAFE + FLEXIBLE)   */
  /* ================================================= */

  private async transition(
    orderId: string,
    transitionFn: (order: Order) => Order,
    tx?: PrismaTransaction,
  ): Promise<Order> {
    if (!orderId) {
      throw new ValidationError(
        'ORDER_ID_REQUIRED',
        'Order id is required',
      );
    }

    const client = tx ?? this.prisma;

    // ✅ already inside tx → don't create new one
    if (tx) {
      return this.transitionInternal(orderId, transitionFn, client);
    }

    // ✅ otherwise wrap automatically
    return this.prisma.$transaction((trx) =>
      this.transitionInternal(orderId, transitionFn, trx),
    );
  }

  private async transitionInternal(
    orderId: string,
    transitionFn: (order: Order) => Order,
    client: PrismaTransaction,
  ): Promise<Order> {
    const order = await this.orderRepo.findById(orderId, client);

    if (!order) {
      throw new ValidationError(
        'ORDER_NOT_FOUND',
        'Order not found',
      );
    }

    const updated = transitionFn(order);

    return this.orderRepo.update(updated, client);
  }

  /* ================================================= */
  /* STATUS TRANSITIONS                               */
  /* ================================================= */

  async markPaymentPending(orderId: string, tx?: PrismaTransaction) {
    return this.transition(orderId, (o) => o.markPaymentPending(), tx);
  }

  async markPaid(orderId: string, tx?: PrismaTransaction) {
    return this.transition(orderId, (o) => o.markPaid(), tx);
  }

  async confirm(orderId: string, tx?: PrismaTransaction) {
    return this.transition(orderId, (o) => o.confirm(), tx);
  }

  async startPreparing(orderId: string, tx?: PrismaTransaction) {
    return this.transition(orderId, (o) => o.startPreparing(), tx);
  }

  async outForDelivery(orderId: string, tx?: PrismaTransaction) {
    return this.transition(orderId, (o) => o.outForDelivery(), tx);
  }

  async deliver(orderId: string, tx?: PrismaTransaction) {
    return this.transition(orderId, (o) => o.deliver(), tx);
  }

  async cancel(orderId: string, tx?: PrismaTransaction) {
    return this.transition(orderId, (o) => o.cancel(), tx);
  }

  async fail(orderId: string, tx?: PrismaTransaction) {
    return this.transition(orderId, (o) => o.fail(), tx);
  }
}
