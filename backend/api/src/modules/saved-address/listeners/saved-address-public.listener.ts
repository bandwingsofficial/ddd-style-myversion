import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { SavedAddressEvents } from '../events/saved-address-events.constants';
import {
  SavedAddressLifecycleEvent,
  SavedAddressUpdatedEvent,
} from '../events/saved-address-events.types';

import { SavedAddressPublicGateway } from '../gateways/saved-address-public.gateway';

@Injectable()
export class SavedAddressPublicListener {
  constructor(
    private readonly gateway: SavedAddressPublicGateway,
  ) {}

  /* ================================================= */
  /* LIFECYCLE                                         */
  /* ================================================= */

  @OnEvent(SavedAddressEvents.SAVED_ADDRESS_CREATED)
  handleSavedAddressCreated(
    event: SavedAddressLifecycleEvent,
  ): void {
    this.gateway.emitSavedAddressCreated({
      savedAddressId: event.savedAddressId,
      customerId: event.customerId,
    });
  }

  @OnEvent(SavedAddressEvents.SAVED_ADDRESS_DELETED)
  handleSavedAddressDeleted(
    event: SavedAddressLifecycleEvent,
  ): void {
    this.gateway.emitSavedAddressDeleted({
      savedAddressId: event.savedAddressId,
      customerId: event.customerId,
    });
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  @OnEvent(SavedAddressEvents.SAVED_ADDRESS_UPDATED)
  handleSavedAddressUpdated(
    event: SavedAddressUpdatedEvent,
  ): void {
    this.gateway.emitSavedAddressUpdated({
      savedAddressId: event.savedAddressId,
      customerId: event.customerId,
      label: event.label,
      addressText: event.addressText,
    });
  }
}
