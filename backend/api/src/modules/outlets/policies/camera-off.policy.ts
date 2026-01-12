// src/modules/outlets/policies/camera-off.policy.ts

import { ValidationError } from '../../../common/errors';
import { Outlet } from '../domain/models/outlet.model';

export class CameraOffPolicy {
  static enforce(outlet: Outlet): void {
    // Camera must currently be streaming (ON)
    if (!outlet.canStreamCamera()) {
      throw new ValidationError(
        'OUTLET_CAMERA_ALREADY_OFF',
        'Camera is already turned off or not streaming',
        { outletId: outlet.id },
      );
    }
  }
}
