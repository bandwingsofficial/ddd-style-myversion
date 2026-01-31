import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { OrderEvents } from './order-events.constants';
import {
  OrderBaseEvent,
  OrderPaidEvent,
} from './order-events.types';

@Injectable()
export class OrderEventsService {
  constructor(private readonly emitter: EventEmitter2) {}

  /* ================================================= */
  /* LIFECYCLE                                         */
  /* ================================================= */

  emitCreated(payload: OrderBaseEvent) {
    console.log('📦 [EVENT EMIT] order.created', payload);
    this.emitter.emit(OrderEvents.ORDER_CREATED, payload);
  }

  emitPaymentPending(payload: OrderBaseEvent) {
    console.log('💳 [EVENT EMIT] order.payment_pending', payload);
    this.emitter.emit(OrderEvents.ORDER_PAYMENT_PENDING, payload);
  }

  emitPaid(payload: OrderPaidEvent) {
    console.log('💚 [EVENT EMIT] order.paid', payload);
    this.emitter.emit(OrderEvents.ORDER_PAID, payload);
  }

  emitConfirmed(payload: OrderBaseEvent) {
    console.log('✅ [EVENT EMIT] order.confirmed', payload);
    this.emitter.emit(OrderEvents.ORDER_CONFIRMED, payload);
  }

  emitPreparing(payload: OrderBaseEvent) {
    console.log('👨‍🍳 [EVENT EMIT] order.preparing', payload);
    this.emitter.emit(OrderEvents.ORDER_PREPARING, payload);
  }

  emitOutForDelivery(payload: OrderBaseEvent) {
    console.log('🛵 [EVENT EMIT] order.out_for_delivery', payload);
    this.emitter.emit(OrderEvents.ORDER_OUT_FOR_DELIVERY, payload);
  }

  emitDelivered(payload: OrderBaseEvent) {
    console.log('📬 [EVENT EMIT] order.delivered', payload);
    this.emitter.emit(OrderEvents.ORDER_DELIVERED, payload);
  }

  emitCancelled(payload: OrderBaseEvent) {
    console.log('❌ [EVENT EMIT] order.cancelled', payload);
    this.emitter.emit(OrderEvents.ORDER_CANCELLED, payload);
  }

  emitFailed(payload: OrderBaseEvent) {
    console.log('🔥 [EVENT EMIT] order.failed', payload);
    this.emitter.emit(OrderEvents.ORDER_FAILED, payload);
  }
}
