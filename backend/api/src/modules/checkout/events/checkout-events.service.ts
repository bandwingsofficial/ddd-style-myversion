import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CheckoutEvents } from './checkout-events.constants';
import {
  CheckoutStartedEvent,
  CheckoutFailedEvent,
} from './checkout-events.types';

@Injectable()
export class CheckoutEventsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /* ================================================= */
  /* STARTED                                           */
  /* ================================================= */

  emitCheckoutStarted(payload: CheckoutStartedEvent): void {
    console.log('🟢 [EVENT EMIT] checkout.started', payload);

    this.eventEmitter.emit(
      CheckoutEvents.CHECKOUT_STARTED,
      payload,
    );
  }

  /* ================================================= */
  /* FAILED                                            */
  /* ================================================= */

  emitCheckoutFailed(payload: CheckoutFailedEvent): void {
    console.log('🔴 [EVENT EMIT] checkout.failed', payload);

    this.eventEmitter.emit(
      CheckoutEvents.CHECKOUT_FAILED,
      payload,
    );
  }
}
