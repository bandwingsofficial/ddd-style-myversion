import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DeliveryEvents } from './delivery-events.constants';
import {
  DeliveryBaseEvent,
  DeliveryLocationEvent,
  DeliveryFailedEvent,
} from './delivery-events.types';

@Injectable()
export class DeliveryEventsService {
  constructor(private readonly emitter: EventEmitter2) {}

  /* ================================================= */
  /* ASSIGNED                                         */
  /* ================================================= */

  emitAssigned(payload: DeliveryBaseEvent) {
    this.emitter.emit(DeliveryEvents.DELIVERY_ASSIGNED, payload);
  }

  /* ================================================= */
  /* PICKED UP                                        */
  /* ================================================= */

  emitPickedUp(payload: DeliveryBaseEvent) {
    this.emitter.emit(DeliveryEvents.DELIVERY_PICKED_UP, payload);
  }

  /* ================================================= */
  /* 🔥 IN TRANSIT (NEW)                               */
  /* ================================================= */

  emitInTransit(payload: DeliveryBaseEvent) {
    this.emitter.emit(DeliveryEvents.DELIVERY_IN_TRANSIT, payload);
  }

  /* ================================================= */
  /* LOCATION UPDATED                                 */
  /* ================================================= */

  emitLocationUpdated(payload: DeliveryLocationEvent) {
    this.emitter.emit(DeliveryEvents.DELIVERY_LOCATION_UPDATED, payload);
  }

  /* ================================================= */
  /* DELIVERED                                        */
  /* ================================================= */

  emitDelivered(payload: DeliveryBaseEvent) {
    this.emitter.emit(DeliveryEvents.DELIVERY_DELIVERED, payload);
  }

  /* ================================================= */
  /* FAILED                                           */
  /* ================================================= */

  emitFailed(payload: DeliveryFailedEvent) {
    this.emitter.emit(DeliveryEvents.DELIVERY_FAILED, payload);
  }
}
