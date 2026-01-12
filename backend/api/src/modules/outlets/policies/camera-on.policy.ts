// src/modules/outlets/policies/camera-on.policy.ts

import { ValidationError } from '../../../common/errors';
import { Outlet } from '../domain/models/outlet.model';

export class CameraOnPolicy {
  static enforce(outlet: Outlet): void {
    // 1️⃣ Outlet must be active
    if (!outlet.isActive()) {
      throw new ValidationError(
        'OUTLET_INACTIVE',
        'Cannot turn camera on for inactive outlet',
        { outletId: outlet.id },
      );
    }

    // 2️⃣ Outlet must be open
    if (!outlet.canAcceptOrders()) {
      throw new ValidationError(
        'OUTLET_CLOSED',
        'Cannot turn camera on while outlet is closed',
        { outletId: outlet.id },
      );
    }

    // 3️⃣ Camera must not already be streaming
    if (outlet.canStreamCamera()) {
      throw new ValidationError(
        'OUTLET_CAMERA_ALREADY_ON',
        'Camera is already live',
        { outletId: outlet.id },
      );
    }

    // 4️⃣ Camera must not be under maintenance
    // (encoded inside CameraState)
    if (outlet.cameraState.isUnderMaintenance?.()) {
      throw new ValidationError(
        'OUTLET_CAMERA_MAINTENANCE',
        'Camera is under maintenance',
        { outletId: outlet.id },
      );
    }
  }
}
