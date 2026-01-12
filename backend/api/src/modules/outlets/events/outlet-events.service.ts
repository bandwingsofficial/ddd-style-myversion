// src/modules/outlets/events/outlet-events.service.ts

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { OutletEvents } from './outlet-events.constants';
import {
  OutletWorkingStatusChangedEvent,
  OutletCameraStatusChangedEvent,
  OutletLifecycleEvent,
} from './outlet-events.types';

@Injectable()
export class OutletEventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  /* ================================================= */
  /* WORKING STATUS                                    */
  /* ================================================= */

  emitWorkingStatusChanged(
    payload: OutletWorkingStatusChangedEvent,
  ): void {
    this.eventEmitter.emit(
      OutletEvents.WORKING_STATUS_CHANGED,
      payload,
    );
  }

  /* ================================================= */
  /* CAMERA                                            */
  /* ================================================= */

  emitCameraStatusChanged(
    payload: OutletCameraStatusChangedEvent,
  ): void {
    this.eventEmitter.emit(
      OutletEvents.CAMERA_STATUS_CHANGED,
      payload,
    );
  }

  /* ================================================= */
  /* OUTLET LIFECYCLE                                  */
  /* ================================================= */

  emitOutletEnabled(payload: OutletLifecycleEvent): void {
    this.eventEmitter.emit(
      OutletEvents.OUTLET_ENABLED,
      payload,
    );
  }

  emitOutletDisabled(payload: OutletLifecycleEvent): void {
    this.eventEmitter.emit(
      OutletEvents.OUTLET_DISABLED,
      payload,
    );
  }
}
