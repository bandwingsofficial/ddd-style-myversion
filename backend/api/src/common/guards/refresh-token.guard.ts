// src/modules/auth/guards/refresh-token.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthErrors } from '../../modules/auth/constants/auth-errors';
import { RefreshTokenService } from '../../modules/auth/services/refresh-token.service';
import { UnauthorizedError } from '../errors';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req =
      context.switchToHttp().getRequest<Request>();

    /**
     * 1️⃣ Extract refresh token
     * Priority:
     *   - Web    → HttpOnly cookie
     *   - Mobile → request body
     */
    const refreshToken =
      req.cookies?.refreshToken ?? // ✅ FIXED
      req.body?.refreshToken;

    if (!refreshToken || typeof refreshToken !== 'string') {
      // ⛔ Generic on purpose (no state leak)
      throw new UnauthorizedError(
        AuthErrors.UNAUTHORIZED,
        'Session expired or invalid',
      );
    }

    /**
     * 2️⃣ Validate refresh token
     */
    const authContext =
      await this.refreshTokenService.validateRefreshToken(
        refreshToken,
      );

    /**
     * 3️⃣ Inject trusted REFRESH auth context
     */
    req.auth = {
      kind: 'refresh',
      actorId: authContext.actorId,
      actorType: authContext.actorType,
      sessionId: authContext.sessionId,
      refreshToken,
    };

    return true;
  }
}
