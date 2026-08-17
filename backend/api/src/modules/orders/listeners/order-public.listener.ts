import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  ORDER_SOCKET_EVENTS,
  OrderPublicGateway,
} from '../gateways/order-public.gateway';
import { OrderEvents } from '../events/order-events.constants';

@Injectable()
export class OrderPublicListener {
  constructor(private readonly gateway: OrderPublicGateway) {}

  @OnEvent(OrderEvents.ORDER_CREATED)
  async handleCreated(payload: Record<string, unknown>): Promise<void> {
    await this.gateway.emitOrderEvent(ORDER_SOCKET_EVENTS.UPDATED, payload);
  }

  @OnEvent(OrderEvents.ORDER_PAYMENT_PENDING)
  async handlePaymentPending(payload: Record<string, unknown>): Promise<void> {
    await this.gateway.emitOrderEvent(ORDER_SOCKET_EVENTS.UPDATED, payload);
  }

  @OnEvent(OrderEvents.ORDER_PAID)
  async handlePaid(payload: Record<string, unknown>): Promise<void> {
    await this.gateway.emitOrderEvent(
      ORDER_SOCKET_EVENTS.PAYMENT_SUCCESS,
      payload,
    );
  }

  @OnEvent(OrderEvents.ORDER_CONFIRMED)
  async handleConfirmed(payload: Record<string, unknown>): Promise<void> {
    await this.gateway.emitOrderEvent(
      ORDER_SOCKET_EVENTS.ORDER_CONFIRMED,
      payload,
    );
    await this.gateway.emitOrderEvent(
      ORDER_SOCKET_EVENTS.ORDER_ACCEPTED,
      payload,
    );
  }

  @OnEvent(OrderEvents.ORDER_PREPARING)
  async handlePreparing(payload: Record<string, unknown>): Promise<void> {
    await this.gateway.emitOrderEvent(ORDER_SOCKET_EVENTS.PREPARING, payload);
  }

  @OnEvent(OrderEvents.ORDER_READY_TO_DISPATCH)
  async handleReadyToDispatch(
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.gateway.emitOrderEvent(ORDER_SOCKET_EVENTS.READY, payload);
  }

  @OnEvent(OrderEvents.ORDER_OUT_FOR_DELIVERY)
  async handleOutForDelivery(payload: Record<string, unknown>): Promise<void> {
    await this.gateway.emitOrderEvent(
      ORDER_SOCKET_EVENTS.OUT_FOR_DELIVERY,
      payload,
    );
  }

  @OnEvent(OrderEvents.ORDER_DELIVERED)
  async handleDelivered(payload: Record<string, unknown>): Promise<void> {
    await this.gateway.emitOrderEvent(ORDER_SOCKET_EVENTS.DELIVERED, payload);
  }

  @OnEvent(OrderEvents.ORDER_CANCELLED)
  async handleCancelled(payload: Record<string, unknown>): Promise<void> {
    await this.gateway.emitOrderEvent(ORDER_SOCKET_EVENTS.UPDATED, payload);
  }

  @OnEvent(OrderEvents.ORDER_FAILED)
  async handleFailed(payload: Record<string, unknown>): Promise<void> {
    await this.gateway.emitOrderEvent(ORDER_SOCKET_EVENTS.UPDATED, payload);
  }
}
