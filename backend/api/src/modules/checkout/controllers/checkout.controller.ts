import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

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
    @CurrentUser() user: { actorId: string },
  ) {
    const data = await this.orchestrator.getCheckoutSummary({
      customerId: user.actorId,
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
