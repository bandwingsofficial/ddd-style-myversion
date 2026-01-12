// src/modules/auth/policies/actor.policy.ts

import { ForbiddenError } from '../../../common/errors';
import { AuthErrors } from '../constants/auth-errors';
import { ActorType } from '../domain/enums/actor-type.enum';

export class ActorPolicy {
  /**
   * Ensures the current actor matches the required actor type(s)
   */
  static check(actual: ActorType, allowed: ActorType | ActorType[]): void {
    const allowedActors = Array.isArray(allowed) ? allowed : [allowed];

    if (!allowedActors.includes(actual)) {
      throw new ForbiddenError(
        AuthErrors.FORBIDDEN,
        'Actor is not allowed to perform this action',
        {
          actual,
          allowed: allowedActors,
        },
      );
    }
  }
}
