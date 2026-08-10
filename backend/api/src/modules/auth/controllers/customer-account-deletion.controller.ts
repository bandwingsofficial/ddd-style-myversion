import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { clearAuthCookies } from '../../../common/http/auth-cookies';
import { getRequestIp } from '../../../common/http/request-ip';

import { ActorType } from '../domain/enums/actor-type.enum';
import { AuthOrchestratorService } from '../services/auth-orchestrator.service';
import { PublicConfirmAccountDeletionDto } from '../dto/public-confirm-account-deletion.dto';
import { RequestOtpDto } from '../dto/request-otp.dto';

@Controller()
export class CustomerAccountDeletionController {
  constructor(private readonly auth: AuthOrchestratorService) {}

  /* ================================================= */
  /* AUTHENTICATED SELF-DELETE (JWT only, no OTP)     */
  /* ================================================= */

  @Delete('me/account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ActorType.CUSTOMER)
  async deleteAuthenticatedAccount(
    @CurrentUser() user: { actorId: string; sessionId?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.auth.deleteAuthenticatedCustomerAccount({
      customerId: user.actorId,
      sessionId: user.sessionId,
      ipAddress: getRequestIp(req),
      userAgent: req.headers['user-agent'],
    });

    if (req.headers['x-client-type'] === 'web') {
      clearAuthCookies(res);
    }

    return {
      success: true,
      code: 'ACCOUNT_DELETED',
      message: 'Your account has been permanently deleted',
      data,
    };
  }

  /* ================================================= */
  /* PUBLIC DELETE (PHONE + OTP) — Google Play        */
  /* ================================================= */

  @Public()
  @Post('auth/customer/account/deletion/otp/request')
  async requestPublicDeletionOtp(
    @Body() body: RequestOtpDto,
    @Req() req: Request,
  ) {
    const data = await this.auth.requestPublicCustomerAccountDeletionOtp({
      phone: body.phone,
      ipAddress: getRequestIp(req),
      userAgent: req.headers['user-agent'],
    });

    return {
      success: true,
      code: 'ACCOUNT_DELETION_OTP_SENT',
      message:
        'If an account exists for this phone number, an OTP has been sent',
      data,
    };
  }

  @Public()
  @Post('auth/customer/account/deletion/confirm')
  async confirmPublicDeletion(
    @Body() body: PublicConfirmAccountDeletionDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.auth.deleteCustomerAccountByPhone({
      phone: body.phone,
      otp: body.otp,
      ipAddress: getRequestIp(req),
      userAgent: req.headers['user-agent'],
    });

    if (req.headers['x-client-type'] === 'web') {
      clearAuthCookies(res);
    }

    return {
      success: true,
      code: 'ACCOUNT_DELETED',
      message:
        'If an account existed for this phone number, it has been permanently deleted',
      data,
    };
  }
}
