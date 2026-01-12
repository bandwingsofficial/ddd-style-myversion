import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { OutletEvents } from '../events/outlet-events.constants';
import {
  OutletWorkingStatusChangedEvent,
  OutletCameraStatusChangedEvent,
  OutletLifecycleEvent,
} from '../events/outlet-events.types';

import { OutletPublicGateway } from '../gateways/outlet-public.gateway';

@Injectable()
export class OutletPublicListener {
  constructor(
    private readonly gateway: OutletPublicGateway,
  ) {}

  /* ================================================= */
  /* WORKING STATUS                                    */
  /* ================================================= */

  @OnEvent(OutletEvents.WORKING_STATUS_CHANGED)
  handleWorkingStatusChanged(
    event: OutletWorkingStatusChangedEvent,
  ): void {
    this.gateway.emitWorkingStatus({
      outletId: event.outletId,
      status: event.status,
    });
  }

  /* ================================================= */
  /* CAMERA                                            */
  /* ================================================= */

  @OnEvent(OutletEvents.CAMERA_STATUS_CHANGED)
  handleCameraStatusChanged(
    event: OutletCameraStatusChangedEvent,
  ): void {
    this.gateway.emitCameraStatus({
      outletId: event.outletId,
      status: event.status,
    });
  }

  /* ================================================= */
  /* LIFECYCLE                                         */
  /* ================================================= */

  @OnEvent(OutletEvents.OUTLET_ENABLED)
  handleOutletEnabled(
    event: OutletLifecycleEvent,
  ): void {
    this.gateway.emitLifecycle({
      outletId: event.outletId,
      status: 'ACTIVE',
    });
  }

  @OnEvent(OutletEvents.OUTLET_DISABLED)
  handleOutletDisabled(
    event: OutletLifecycleEvent,
  ): void {
    this.gateway.emitLifecycle({
      outletId: event.outletId,
      status: 'INACTIVE',
    });
  }
}
