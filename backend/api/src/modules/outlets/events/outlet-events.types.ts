// src/modules/outlets/events/outlet-events.types.ts

import { OutletWorkingStatus } from '../domain/enums/outlet-working-status.enum';

export interface OutletWorkingStatusChangedEvent {
  outletId: string;
  status: OutletWorkingStatus;
}

export interface OutletCameraStatusChangedEvent {
  outletId: string;
  status: 'ON' | 'OFF';
}

export interface OutletLifecycleEvent {
  outletId: string;
}
