import { Injectable } from '@nestjs/common';

import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OrderService } from './order.service';
import { OrderStatusService } from './order-status.service';

import { Cart } from '../../cart/domain/models/cart.model';
import { SavedAddress } from '../../saved-address/domain/models/saved-address.model';

import { Order } from '../domain/models/order.model';

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
      deliveryFee: number;
    },
    tx?: PrismaTransaction,
  ): Promise<Order> {
    return this.orderService.createFromCart(params, tx);
  }

  /* ================================================= */
  /* STATUS TRANSITIONS (TX SAFE)                      */
  /* ================================================= */

  async markPaymentPendingOrder(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<Order> {
    return this.orderStatusService.markPaymentPending(orderId, tx);
  }

  async markPaidOrder(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<Order> {
    return this.orderStatusService.markPaid(orderId, tx);
  }

  async confirmOrder(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<Order> {
    return this.orderStatusService.confirm(orderId, tx);
  }

  async startPreparingOrder(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<Order> {
    return this.orderStatusService.startPreparing(orderId, tx);
  }

  async outForDeliveryOrder(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<Order> {
    return this.orderStatusService.outForDelivery(orderId, tx);
  }

  async deliverOrder(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<Order> {
    return this.orderStatusService.deliver(orderId, tx);
  }

  async cancelOrder(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<Order> {
    return this.orderStatusService.cancel(orderId, tx);
  }

  async failOrder(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<Order> {
    return this.orderStatusService.fail(orderId, tx);
  }
}
