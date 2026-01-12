// src/common/decorators/current-user.decorator.ts

import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import {
  AccessAuthContext,
  RefreshAuthContext,
} from '../../types/express';

export type CurrentUserContext =
  | AccessAuthContext
  | RefreshAuthContext;

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserContext => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.auth) {
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    return request.auth;
  },
);
