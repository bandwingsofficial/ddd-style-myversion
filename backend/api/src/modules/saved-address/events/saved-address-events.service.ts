import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { SavedAddressEvents } from './saved-address-events.constants';
import {
  SavedAddressLifecycleEvent,
  SavedAddressUpdatedEvent,
} from './saved-address-events.types';

@Injectable()
export class SavedAddressEventsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /* ================================================= */
  /* LIFECYCLE                                         */
  /* ================================================= */

  emitSavedAddressCreated(
    payload: SavedAddressLifecycleEvent,
  ): void {
    this.eventEmitter.emit(
      SavedAddressEvents.SAVED_ADDRESS_CREATED,
      payload,
    );
  }

  emitSavedAddressDeleted(
    payload: SavedAddressLifecycleEvent,
  ): void {
    this.eventEmitter.emit(
      SavedAddressEvents.SAVED_ADDRESS_DELETED,
      payload,
    );
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  emitSavedAddressUpdated(
    payload: SavedAddressUpdatedEvent,
  ): void {
    this.eventEmitter.emit(
      SavedAddressEvents.SAVED_ADDRESS_UPDATED,
      payload,
    );
  }
}
