import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { ActorType } from '../domain/enums/actor-type.enum';
import { OtpPurpose } from '../domain/enums/otp-purpose.enum';
import { AuthOrchestratorService } from '../services/auth-orchestrator.service';

import { RequestOtpDto } from '../dto/request-otp.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';

import { Public } from '../../../common/decorators/public.decorator';
import { setAuthCookies } from '../../../common/http/auth-cookies';
import { getRequestIp } from '../../../common/http/request-ip';

@Controller('auth')
@Public()
export class AuthOtpController {
  constructor(private readonly auth: AuthOrchestratorService) {}

  /* ================================================= */
  /* CUSTOMER                                          */
  /* ================================================= */

  @Post('customer/otp/request')
  async requestCustomerOtp(
    @Body() body: RequestOtpDto,
    @Req() req: Request,
  ) {
    const data = await this.auth.requestOtp({
      actorType: ActorType.CUSTOMER,
      phone: body.phone,
      purpose: OtpPurpose.LOGIN,
      ipAddress: getRequestIp(req),
      userAgent: req.headers['user-agent'],
    });

    return {
      success: true,
      code: 'OTP_SENT',
      message: 'OTP sent successfully',
      data,
    };
  }

  @Post('customer/otp/verify')
  async verifyCustomerOtp(
    @Body() body: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const auth = await this.auth.loginWithOtp({
      actorType: ActorType.CUSTOMER,
      phone: body.phone,
      otp: body.otp,
      deviceId: req.headers['x-device-id'] as string | undefined,
      ipAddress: getRequestIp(req),
      userAgent: req.headers['user-agent'],
    });

    const isWeb = req.headers['x-client-type'] === 'web';

    if (isWeb) {
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

    // 📱 MOBILE RESPONSE (explicit & safe)
    return {
      success: true,
      code: 'LOGIN_SUCCESS',
      message: 'Login successful',
      data: {
        actorType: auth.actorType,
        actorId: auth.actorId,
        sessionId: auth.sessionId,
        roles: auth.roles,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        accessTokenExpiresAt: auth.accessTokenExpiresAt,
        refreshTokenExpiresAt: auth.refreshTokenExpiresAt,
      },
    };
  }

  /* ================================================= */
  /* DELIVERY                                          */
  /* ================================================= */

  @Post('delivery/otp/request')
  async requestDeliveryOtp(
    @Body() body: RequestOtpDto,
    @Req() req: Request,
  ) {
    const data = await this.auth.requestOtp({
      actorType: ActorType.DELIVERY,
      phone: body.phone,
      purpose: OtpPurpose.LOGIN,
      ipAddress: getRequestIp(req),
      userAgent: req.headers['user-agent'],
    });

    return {
      success: true,
      code: 'OTP_SENT',
      message: 'OTP sent successfully',
      data,
    };
  }

  @Post('delivery/otp/verify')
  async verifyDeliveryOtp(
    @Body() body: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const auth = await this.auth.loginWithOtp({
      actorType: ActorType.DELIVERY,
      phone: body.phone,
      otp: body.otp,
      deviceId: req.headers['x-device-id'] as string | undefined,
      ipAddress: getRequestIp(req),
      userAgent: req.headers['user-agent'],
    });

    const isWeb = req.headers['x-client-type'] === 'web';

    if (isWeb) {
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

    // 📱 MOBILE RESPONSE
    return {
      success: true,
      code: 'LOGIN_SUCCESS',
      message: 'Login successful',
      data: {
        actorType: auth.actorType,
        actorId: auth.actorId,
        sessionId: auth.sessionId,
        roles: auth.roles,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        accessTokenExpiresAt: auth.accessTokenExpiresAt,
        refreshTokenExpiresAt: auth.refreshTokenExpiresAt,
      },
    };
  }
}
