// src/modules/outlets/policies/outlet-active.policy.ts

import { ValidationError } from '../../../common/errors';
import { Outlet } from '../domain/models/outlet.model';

export class OutletActivePolicy {
  static enforce(outlet: Outlet): void {
    if (!outlet.isActive()) {
      throw new ValidationError(
        'OUTLET_INACTIVE',
        'Outlet is disabled by admin',
        { outletId: outlet.id },
      );
    }
  }
}
