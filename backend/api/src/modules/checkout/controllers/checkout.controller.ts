import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ValidationError,
} from '../../../common/errors';

import { CheckoutOrchestratorService } from '../services/checkout-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

import { StartCheckoutDto } from '../dto/start-checkout.dto';
import { CheckoutSummaryParamsDto } from '../dto/checkout-summary.dto';

@Controller('checkout')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.CUSTOMER)
export class CheckoutController {
  constructor(
    private readonly orchestrator: CheckoutOrchestratorService,
  ) {}

  /* ================================================= */
  /* SUMMARY                                          */
  /* ================================================= */

  @Get('summary/:savedAddressId')
async getCheckoutSummary(
  @Param() params: CheckoutSummaryParamsDto,
  @Query('outletId') outletId: string,
  @CurrentUser() user: { actorId: string },
) {
  if (!outletId) {
    throw new ValidationError('OUTLET_ID_REQUIRED', 'Outlet id is required');
  }

  const data = await this.orchestrator.getCheckoutSummary({
    customerId: user.actorId,
    outletId,
    savedAddressId: params.savedAddressId,
  });

  return {
    success: true,
    code: 'CHECKOUT_SUMMARY_FETCHED',
    message: 'Checkout summary fetched successfully',
    data,
  };
}
  /* ================================================= */
  /* START CHECKOUT                                   */
  /* ================================================= */

@Post('start')
async startCheckout(
  @CurrentUser() user: { actorId: string },
  @Body() body: StartCheckoutDto,
) {
  const data = await this.orchestrator.startCheckout({
    customerId: user.actorId,
    outletId: body.outletId, // 🔥 REQUIRED
    savedAddressId: body.savedAddressId,
  });

  return {
    success: true,
    code: 'CHECKOUT_STARTED',
    message: 'Checkout started successfully',
    data,
  };
}
}
