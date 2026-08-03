import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { PaymentOrchestratorService } from '../services/payment-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';
import { ValidationError } from '../../../common/errors';

import { PaymentResponseDto } from '../dtos/payment-response.dto';
import { ConfirmPaymentDto } from '../dtos/confirm-payment.dto';
import { PaymentStatus } from '../domain/enums/payment-status.enum';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.CUSTOMER)
export class PaymentController {
  constructor(private readonly orchestrator: PaymentOrchestratorService) {}

  @Get(':paymentId')
  async getPayment(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    const payment = await this.orchestrator.getPaymentById(paymentId);

    return {
      success: true,
      code: 'PAYMENT_FETCHED',
      message: 'Payment fetched successfully',
      data: PaymentResponseDto.fromDomain(payment),
    };
  }

  @Post(':paymentId/confirm')
  async confirmPayment(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Body() dto: ConfirmPaymentDto,
  ) {
    const payment = await this.orchestrator.confirmPayment({
      paymentId,
      razorpayPaymentId: dto.razorpayPaymentId,
      razorpayOrderId: dto.razorpayOrderId,
      razorpaySignature: dto.razorpaySignature,
    });

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new ValidationError(
        'PAYMENT_VERIFICATION_FAILED',
        'Payment verification failed. Please retry or contact support if amount was deducted.',
      );
    }

    return {
      success: true,
      code: 'PAYMENT_CONFIRMED',
      message: 'Payment verified successfully',
      data: PaymentResponseDto.fromDomain(payment),
    };
  }
}
