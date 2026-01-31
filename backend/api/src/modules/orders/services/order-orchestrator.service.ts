import { Injectable } from '@nestjs/common';

import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OrderService } from './order.service';
import { OrderStatusService } from './order-status.service';

import { Cart } from '../../cart/domain/models/cart.model';
import { SavedAddress } from '../../saved-address/domain/models/saved-address.model';

import { Order } from '../domain/models/order.model';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

@Injectable()
export class OrderOrchestratorService {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderStatusService: OrderStatusService,
  ) {}

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  async getOrderById(orderId: string): Promise<Order> {
    return this.orderService.getById(orderId);
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return this.orderService.getCustomerOrders(customerId);
  }

  /* ================================================= */
  /* CREATE (TX AWARE)                                 */
  /* ================================================= */

  async createOrderFromCart(
    params: {
      cart: Cart;
      address: SavedAddress;
    },
    tx?: PrismaTransaction,
  ): Promise<Order> {
    return this.orderService.createFromCart(params, tx);
  }

  /* ================================================= */
  /* STATUS TRANSITIONS (TX SAFE)                      */
  /* ================================================= */

  async markPaymentPendingOrder(orderId: string, tx?: PrismaTransaction) {
    return this.orderStatusService.markPaymentPending(orderId, tx);
  }

  async markPaidOrder(orderId: string, tx?: PrismaTransaction) {
    return this.orderStatusService.markPaid(orderId, tx);
  }

  async confirmOrder(orderId: string, tx?: PrismaTransaction) {
    return this.orderStatusService.confirm(orderId, tx);
  }

  async startPreparingOrder(orderId: string, tx?: PrismaTransaction) {
    return this.orderStatusService.startPreparing(orderId, tx);
  }

  async outForDeliveryOrder(orderId: string, tx?: PrismaTransaction) {
    return this.orderStatusService.outForDelivery(orderId, tx);
  }

  async deliverOrder(orderId: string, tx?: PrismaTransaction) {
    return this.orderStatusService.deliver(orderId, tx);
  }

  /* ================================================= */
  /* CANCEL WITH ACTOR TRACKING                        */
  /* ================================================= */

  async cancelOrder(
    orderId: string,
    actor: { actorType: ActorType; actorId: string },
    tx?: PrismaTransaction,
  ) {
    return this.orderStatusService.cancel(orderId, actor, tx);
  }

  /* ================================================= */
  /* FAILED                                            */
  /* ================================================= */

  async failOrder(orderId: string, tx?: PrismaTransaction) {
    return this.orderStatusService.fail(orderId, tx);
  }

  async getOutletOrders(outletId: string): Promise<Order[]> {
    return this.orderService.getOutletOrders(outletId);
  }
}
