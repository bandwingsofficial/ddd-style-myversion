import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { ActorType } from '../domain/enums/actor-type.enum';
import { AuthOrchestratorService } from '../services/auth-orchestrator.service';

import { Public } from '../../../common/decorators/public.decorator';
import { setAuthCookies } from '../../../common/http/auth-cookies';
import { getRequestIp } from '../../../common/http/request-ip';
import { OutletLoginDto } from '../dto/outlet-login.dto';

@Controller('auth/outlets')
@Public() // 👈 LOGIN ROUTES ARE PRE-AUTH
export class OutletAuthController {
  constructor(private readonly auth: AuthOrchestratorService) {}

  @Post('login')
  async login(
    @Body() body: OutletLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const auth = await this.auth.loginWithPassword({
      actorType: ActorType.OUTLET_USER,
      email: body.email,
      password: body.password,
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
