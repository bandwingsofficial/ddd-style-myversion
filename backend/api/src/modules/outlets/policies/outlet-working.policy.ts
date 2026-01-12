// src/modules/outlets/policies/outlet-working.policy.ts

import { ValidationError } from '../../../common/errors';
import { Outlet } from '../domain/models/outlet.model';

export class OutletWorkingPolicy {
  static enforce(outlet: Outlet): void {
    const workingState = outlet.workingState;

    if (workingState.isTemporarilyClosed()) {
      throw new ValidationError(
        'OUTLET_TEMPORARILY_CLOSED',
        'Outlet is temporarily closed',
        { outletId: outlet.id },
      );
    }

    if (workingState.isClosed()) {
      throw new ValidationError(
        'OUTLET_CLOSED',
        'Outlet is currently closed',
        { outletId: outlet.id },
      );
    }
  }
}
