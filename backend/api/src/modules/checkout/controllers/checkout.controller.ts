import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ValidationError } from '../../../common/errors';

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
  constructor(private readonly orchestrator: CheckoutOrchestratorService) {}

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

  @Get('active')
  async getActiveCheckout(
    @Query('outletId') outletId: string,
    @CurrentUser() user: { actorId: string },
  ) {
    if (!outletId) {
      throw new ValidationError('OUTLET_ID_REQUIRED', 'Outlet id is required');
    }

    const data = await this.orchestrator.getActiveCheckout({
      customerId: user.actorId,
      outletId,
    });

    return {
      success: true,
      code: data ? 'ACTIVE_CHECKOUT_FOUND' : 'NO_ACTIVE_CHECKOUT',
      message: data
        ? 'Active checkout session found'
        : 'No active checkout session',
      data,
    };
  }

  @Get('pending')
  async listPendingOrders(@CurrentUser() user: { actorId: string }) {
    const data = await this.orchestrator.listPendingOrders(user.actorId);

    return {
      success: true,
      code: 'PENDING_ORDERS_FETCHED',
      message: 'Pending payment orders fetched successfully',
      data,
    };
  }

  @Post('start')
  async startCheckout(
    @CurrentUser() user: { actorId: string },
    @Body() body: StartCheckoutDto,
  ) {
    const data = await this.orchestrator.startCheckout({
      customerId: user.actorId,
      outletId: body.outletId,
      savedAddressId: body.savedAddressId,
      orderNotes: body.orderNotes,
      deliveryInstructions: body.deliveryInstructions,
    });

    return {
      success: true,
      code: 'CHECKOUT_STARTED',
      message: 'Checkout started successfully',
      data,
    };
  }

  @Post('orders/:orderId/retry-payment')
  async retryPayment(
    @Param('orderId') orderId: string,
    @CurrentUser() user: { actorId: string },
  ) {
    const data = await this.orchestrator.retryPayment({
      customerId: user.actorId,
      orderId,
    });

    return {
      success: true,
      code: 'PAYMENT_RETRY_STARTED',
      message: 'Payment retry started successfully',
      data,
    };
  }
}
