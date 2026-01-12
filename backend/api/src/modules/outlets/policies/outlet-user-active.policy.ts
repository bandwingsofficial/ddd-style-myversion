// src/modules/outlets/policies/outlet-user-active.policy.ts

import { ValidationError } from '../../../common/errors';
import { OutletUser } from '../domain/models/outlet-user.model';

export class OutletUserActivePolicy {
  static enforce(user: OutletUser): void {
    if (!user.isActive) {
      throw new ValidationError(
        'OUTLET_USER_INACTIVE',
        'Outlet user is inactive',
        { userId: user.id },
      );
    }
  }
}
