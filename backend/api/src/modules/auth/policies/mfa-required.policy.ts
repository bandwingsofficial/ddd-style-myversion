// src/modules/auth/policies/mfa-required.policy.ts

import { ForbiddenError } from '../../../common/errors';
import { AuthErrors } from '../constants/auth-errors';
import { SuperAdmin } from '../domain/models/super-admin.model';

export class MfaRequiredPolicy {
  static check(admin: SuperAdmin, totpProvided: boolean): void {
    if (admin.mfaEnabled && !totpProvided) {
      throw new ForbiddenError(
        AuthErrors.MFA_REQUIRED,
        'Multi-factor authentication required',
      );
    }
  }
}
