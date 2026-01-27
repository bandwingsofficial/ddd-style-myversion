import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { PaymentOrchestratorService } from '../services/payment-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

import { PaymentResponseDto } from '../dtos/payment-response.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.CUSTOMER)
export class PaymentController {
  constructor(
    private readonly orchestrator: PaymentOrchestratorService,
  ) {}

  /* ================================================= */
  /* GET PAYMENT                                      */
  /* ================================================= */

  @Get(':paymentId')
  async getPayment(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ) {
    const payment =
      await this.orchestrator.getPaymentById(paymentId);

    return {
      success: true,
      code: 'PAYMENT_FETCHED',
      message: 'Payment fetched successfully',
      data: PaymentResponseDto.fromDomain(payment),
    };
  }

  /* ================================================= */
  /* CONFIRM PAYMENT                                  */
  /* ================================================= */

  @Post(':paymentId/confirm')
  async confirmPayment(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ) {
    const payment =
      await this.orchestrator.confirmPayment({
        paymentId,
      });

    return {
      success: true,
      code: 'PAYMENT_CONFIRMED',
      message: 'Payment verified successfully',
      data: PaymentResponseDto.fromDomain(payment),
    };
  }
}
