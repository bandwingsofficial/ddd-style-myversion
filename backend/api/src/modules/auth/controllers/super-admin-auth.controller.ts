import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthOrchestratorService } from '../services/auth-orchestrator.service';

import { Public } from '../../../common/decorators/public.decorator';
import { setAuthCookies } from '../../../common/http/auth-cookies';
import { getRequestIp } from '../../../common/http/request-ip';
import { SuperAdminLoginDto } from '../dto/super-admin-login.dto';
import { SuperAdminMfaDto } from '../dto/super-admin-mfa.dto';

@Controller('auth/super')
@Public() // 👈 BOTH STEPS ARE PRE-AUTH
export class SuperAdminAuthController {
  constructor(private readonly auth: AuthOrchestratorService) {}

  /**
   * Step 1: Password verification → MFA challenge
   */
  @Post('login')
  async login(@Body() body: SuperAdminLoginDto, @Req() req: Request) {
    const data = await this.auth.startSuperAdminLogin({
      email: body.email,
      password: body.password,
      ipAddress: getRequestIp(req),
      userAgent: req.headers['user-agent'],
    });

    return {
      success: true,
      code: 'MFA_CHALLENGE_CREATED',
      message: 'MFA verification required',
      data,
    };
  }

  /**
   * Step 2: MFA verification → session + tokens
   */
  @Post('verify-mfa')
  async verifyMfa(
    @Body() body: SuperAdminMfaDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const auth = await this.auth.verifySuperAdminMfa({
      challengeId: body.challengeId,
      code: body.code,
      deviceId: req.headers['x-device-id'] as string | undefined,
      ipAddress: getRequestIp(req),
      userAgent: req.headers['user-agent'],
    });

    const clientType = req.headers['x-client-type'];

    // 🌐 WEB → COOKIES ONLY
    if (clientType === 'web') {
      setAuthCookies(res, auth);

      return {
        success: true,
        code: 'LOGIN_SUCCESS',
        message: 'Login successful',
        data: {
          actorType: auth.actorType,
          actorId: auth.actorId,
          sessionId: auth.sessionId,
          roles: auth.roles,
        },
      };
    }

    // 📱 MOBILE → JSON TOKENS
    return {
      success: true,
      code: 'LOGIN_SUCCESS',
      message: 'Login successful',
      data: auth,
    };
  }
}
