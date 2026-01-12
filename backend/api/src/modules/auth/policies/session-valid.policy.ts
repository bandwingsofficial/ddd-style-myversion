// src/modules/auth/policies/session-valid.policy.ts

import { ForbiddenError } from '../../../common/errors';
import { AuthErrors } from '../constants/auth-errors';
import { AuthSession } from '../domain/models/auth-session.model';

export class SessionValidPolicy {
  static check(session: AuthSession): void {
    if (session.isRevoked()) {
      throw new ForbiddenError(
        AuthErrors.SESSION_REVOKED,
        'Session has been revoked',
      );
    }
  }
}
