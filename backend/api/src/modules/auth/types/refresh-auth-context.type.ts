// src/modules/auth/types/refresh-auth-context.type.ts

import { ActorType } from '../domain/enums/actor-type.enum';

export interface RefreshAuthContext {
  actorType: ActorType;
  actorId: string;
  sessionId: string;
}
