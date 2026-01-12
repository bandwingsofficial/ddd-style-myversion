import 'express';
import { ActorType } from '../modules/auth/domain/enums/actor-type.enum';

export type AccessAuthContext = {
  kind: 'access';
  actorId: string;
  actorType: ActorType;
  sessionId: string;
  tokenVersion: number;
};

export type RefreshAuthContext = {
  kind: 'refresh';
  actorId: string;
  actorType: ActorType;
  sessionId: string;
  refreshToken: string;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AccessAuthContext | RefreshAuthContext;
    }
  }
}

export {};
