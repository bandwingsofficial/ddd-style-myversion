import { Injectable } from '@nestjs/common';

import { OrderRepository } from '../repositories/order.repository';
import { OrderEventRepository } from '../repositories/order-event.repository';

import { Order } from '../domain/models/order.model';

import { ValidationError } from '../../../common/errors';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OrderEventsService } from '../events/order-events.service';

import { OrderEventType } from '@prisma/client';
import { ActorType } from '../../auth/domain/enums/actor-type.enum'; // ✅ NEW

@Injectable()
export class OrderStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderRepo: OrderRepository,
    private readonly orderEventRepo: OrderEventRepository,
    private readonly events: OrderEventsService,
  ) {}

  /* ================================================= */
  /* GENERIC TRANSITION WRAPPER (🔥 ACTOR SUPPORT)      */
  /* ================================================= */

  private async transition(
    orderId: string,
    transitionFn: (order: Order) => Order,
    actor?: {
      actorType: ActorType;
      actorId: string;
    },
    tx?: PrismaTransaction,
  ): Promise<Order> {
    if (!orderId) {
      throw new ValidationError('ORDER_ID_REQUIRED', 'Order id is required');
    }

    const client = tx ?? this.prisma;

    if (tx) {
      return this.transitionInternal(orderId, transitionFn, actor, client);
    }

    return this.prisma.$transaction((trx) =>
      this.transitionInternal(orderId, transitionFn, actor, trx),
    );
  }

  private async transitionInternal(
    orderId: string,
    transitionFn: (order: Order) => Order,
    actor: {
      actorType: ActorType;
      actorId: string;
    } | undefined,
    client: PrismaTransaction,
  ): Promise<Order> {
    const order = await this.orderRepo.findById(orderId, client);

    if (!order) {
      throw new ValidationError('ORDER_NOT_FOUND', 'Order not found');
    }

    const updated = transitionFn(order);

    /* ------------------------------- */
    /* Persist order                  */
    /* ------------------------------- */

    await this.orderRepo.update(updated, client);

    /* ------------------------------- */
    /* 🔥 Persist DB event with actor  */
    /* ------------------------------- */

    await this.orderEventRepo.create(
      {
        orderId: updated.id,
        type: updated.status as OrderEventType,
        actorType: actor?.actorType,
        actorId: actor?.actorId,
        metadata: {
          version: updated.version,
        },
      },
      client,
    );

    return updated;
  }

  /* ================================================= */
  /* PAYLOAD BUILDER                                   */
  /* ================================================= */

  private basePayload(order: Order) {
    return {
      orderId: order.id,
      customerId: order.customerId,
      outletId: order.outletId,
      status: order.status,
      occurredAt: new Date(),
    };
  }

  /* ================================================= */
  /* STATUS TRANSITIONS                                */
  /* ================================================= */

  async markPaymentPending(orderId: string, tx?: PrismaTransaction) {
    const order = await this.transition(
      orderId,
      (o) => o.markPaymentPending(),
      undefined,
      tx,
    );

    this.events.emitPaymentPending(this.basePayload(order));
    return order;
  }

  async markPaid(orderId: string, tx?: PrismaTransaction) {
    const order = await this.transition(
      orderId,
      (o) => o.markPaid(),
      undefined,
      tx,
    );

    this.events.emitPaid({
      ...this.basePayload(order),
      amount: order.grandTotal.toNumber(),
    });

    return order;
  }

  async confirm(orderId: string, tx?: PrismaTransaction) {
    const order = await this.transition(orderId, (o) => o.confirm(), undefined, tx);

    this.events.emitConfirmed(this.basePayload(order));
    return order;
  }

  async startPreparing(orderId: string, tx?: PrismaTransaction) {
    const order = await this.transition(orderId, (o) => o.startPreparing(), undefined, tx);

    this.events.emitPreparing(this.basePayload(order));
    return order;
  }

  async outForDelivery(orderId: string, tx?: PrismaTransaction) {
    const order = await this.transition(orderId, (o) => o.outForDelivery(), undefined, tx);

    this.events.emitOutForDelivery(this.basePayload(order));
    return order;
  }

  async deliver(orderId: string, tx?: PrismaTransaction) {
    const order = await this.transition(orderId, (o) => o.deliver(), undefined, tx);

    this.events.emitDelivered(this.basePayload(order));
    return order;
  }

  /* 🔥 actor aware */
  async cancel(
    orderId: string,
    actor: { actorType: ActorType; actorId: string },
    tx?: PrismaTransaction,
  ) {
    const order = await this.transition(orderId, (o) => o.cancel(), actor, tx);

    this.events.emitCancelled(this.basePayload(order));
    return order;
  }

  async fail(orderId: string, tx?: PrismaTransaction) {
    const order = await this.transition(orderId, (o) => o.fail(), undefined, tx);

    this.events.emitFailed(this.basePayload(order));
    return order;
  }
}
