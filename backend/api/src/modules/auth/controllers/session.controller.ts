// src/modules/auth/controllers/session.controller.ts

import {
  Controller,
  Get,
  Post,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthOrchestratorService } from '../services/auth-orchestrator.service';
import { getRequestIp } from '../../../common/http/request-ip';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RefreshTokenGuard } from '../../../common/guards/refresh-token.guard';

import {
  clearAuthCookies,
  setAuthCookies,
} from '../../../common/http/auth-cookies';

import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import {
  AccessAuthContext,
  RefreshAuthContext,
} from '../../../types/express';

@Controller('auth/session')
export class SessionController {
  constructor(
    private readonly auth: AuthOrchestratorService,
  ) {}

  /* ================================================= */
  /* REFRESH                                          */
  /* ================================================= */

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @CurrentUser() user: RefreshAuthContext,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('🔁 [REFRESH] hit');
    console.log('🔁 [REFRESH] cookies:', req.headers.cookie);
    console.log('🔁 [REFRESH] user:', user);
    console.log('🔁 [REFRESH] ip:', getRequestIp(req));
    console.log('🔁 [REFRESH] ua:', req.headers['user-agent']);
    console.log(
      '🔁 [REFRESH] client:',
      req.headers['x-client-type'],
    );

    if (user.kind !== 'refresh') {
      console.log('❌ [REFRESH] invalid context');
      throw new UnauthorizedException(
        'INVALID_AUTH_CONTEXT',
      );
    }

    const auth = await this.auth.refreshSession({
      actorType: user.actorType,
      actorId: user.actorId,
      sessionId: user.sessionId,
      refreshToken: user.refreshToken,
      ipAddress: getRequestIp(req),
      userAgent: req.headers['user-agent'],
    });

    console.log('✅ [REFRESH] new session issued');

    const isWeb =
      req.headers['x-client-type'] === 'web';

    if (isWeb) {
      console.log('🌐 [REFRESH] setting cookies');
      setAuthCookies(res, auth);

      return {
        success: true,
        code: 'TOKEN_REFRESHED',
        message: 'Session refreshed',
        data: {
          actorType: auth.actorType,
          actorId: auth.actorId,
          sessionId: auth.sessionId,
          roles: auth.roles,
        },
      };
    }

    return {
      success: true,
      code: 'TOKEN_REFRESHED',
      message: 'Session refreshed',
      data: {
        actorType: auth.actorType,
        actorId: auth.actorId,
        sessionId: auth.sessionId,
        roles: auth.roles,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        accessTokenExpiresAt:
          auth.accessTokenExpiresAt,
        refreshTokenExpiresAt:
          auth.refreshTokenExpiresAt,
      },
    };
  }

  /* ================================================= */
  /* LOGOUT                                           */
  /* ================================================= */

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: AccessAuthContext,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('🚪 [LOGOUT] hit');
    console.log('🚪 [LOGOUT] cookies:', req.headers.cookie);
    console.log('🚪 [LOGOUT] user:', user);

    if (user.kind !== 'access') {
      console.log('❌ [LOGOUT] invalid context');
      throw new UnauthorizedException(
        'INVALID_AUTH_CONTEXT',
      );
    }

    await this.auth.logout({
      actorType: user.actorType,
      actorId: user.actorId,
      sessionId: user.sessionId,
      ipAddress: getRequestIp(req),
      userAgent: req.headers['user-agent'],
    });

    if (
      req.headers['x-client-type'] === 'web'
    ) {
      console.log('🧹 [LOGOUT] clearing cookies');
      clearAuthCookies(res);
    }

    return {
      success: true,
      code: 'LOGOUT_SUCCESS',
      message: 'Logged out successfully',
      data: null,
    };
  }

  /* ================================================= */
  /* ME                                               */
  /* ================================================= */

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @CurrentUser() user: AccessAuthContext,
    @Req() req: Request,
  ) {
    console.log('👤 [ME] hit');
    console.log('👤 [ME] cookies:', req.headers.cookie);
    console.log('👤 [ME] user:', user);

    if (user.kind !== 'access') {
      console.log('❌ [ME] invalid context');
      throw new UnauthorizedException(
        'INVALID_AUTH_CONTEXT',
      );
    }

    return {
      success: true,
      code: 'AUTH_CONTEXT',
      message: 'Authenticated user context',
      data: {
        actorType: user.actorType,
        actorId: user.actorId,
        sessionId: user.sessionId,
      },
    };
  }
}
