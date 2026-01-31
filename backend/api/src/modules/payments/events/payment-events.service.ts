import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { PaymentEvents } from './payment-events.constants';
import {
  PaymentInitiatedEvent,
  PaymentSuccessEvent,
  PaymentFailedEvent,
  PaymentRefundedEvent,
} from './payment-events.types';

@Injectable()
export class PaymentEventsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /* ================================================= */
  /* PAYMENT LIFECYCLE                                 */
  /* ================================================= */

  emitPaymentInitiated(
    payload: PaymentInitiatedEvent,
  ): void {
    console.log(
      '💳 [EVENT EMIT] payment.initiated',
      payload,
    );

    this.eventEmitter.emit(
      PaymentEvents.PAYMENT_INITIATED,
      payload,
    );
  }

  emitPaymentSuccess(
    payload: PaymentSuccessEvent,
  ): void {
    console.log(
      '💚 [EVENT EMIT] payment.success',
      payload,
    );

    this.eventEmitter.emit(
      PaymentEvents.PAYMENT_SUCCESS,
      payload,
    );
  }

  emitPaymentFailed(
    payload: PaymentFailedEvent,
  ): void {
    console.log(
      '❤️‍🩹 [EVENT EMIT] payment.failed',
      payload,
    );

    this.eventEmitter.emit(
      PaymentEvents.PAYMENT_FAILED,
      payload,
    );
  }

  emitPaymentRefunded(
    payload: PaymentRefundedEvent,
  ): void {
    console.log(
      '↩️ [EVENT EMIT] payment.refunded',
      payload,
    );

    this.eventEmitter.emit(
      PaymentEvents.PAYMENT_REFUNDED,
      payload,
    );
  }
}
