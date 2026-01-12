// src/modules/auth/policies/identity-active.policy.ts

import { Customer } from '../domain/models/customer.model';
import { DeliveryPartner } from '../domain/models/delivery-partner.model';
import { OutletUser } from '../domain/models/outlet-user.model';
import { SuperAdmin } from '../domain/models/super-admin.model';

import { ForbiddenError } from '../../../common/errors';
import { AuthErrors } from '../constants/auth-errors';

type Identity = Customer | DeliveryPartner | OutletUser | SuperAdmin;

export class IdentityActivePolicy {
  static check(identity: Identity): void {
    if (identity.canLogin()) {
      return;
    }

    // OutletUser-specific: locked account
    if (identity instanceof OutletUser && identity.isLocked()) {
      throw new ForbiddenError(
        AuthErrors.ACCOUNT_LOCKED,
        'Account temporarily locked',
        {
          lockedUntil: identity.lockedUntil,
        },
      );
    }

    // Generic inactive / blocked / suspended
    throw new ForbiddenError(
      AuthErrors.ACCOUNT_INACTIVE,
      'Account is inactive',
    );
  }
}
