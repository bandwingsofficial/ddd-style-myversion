// src/modules/auth/guards/roles.guard.ts

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { ActorType } from '../../modules/auth/domain/enums/actor-type.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<ActorType[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    // No role restriction
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const auth = request.auth;

    /**
     * Must be authenticated with ACCESS token
     */
    if (!auth || auth.kind !== 'access') {
      throw new ForbiddenException('ACCESS_DENIED');
    }

    /**
     * Actor type must match allowed roles
     */
    if (!requiredRoles.includes(auth.actorType)) {
      throw new ForbiddenException('INSUFFICIENT_ROLE');
    }

    return true;
  }
}
