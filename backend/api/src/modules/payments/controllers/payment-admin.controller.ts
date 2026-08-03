import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ActorType } from '../../auth/domain/enums/actor-type.enum';

import { PaymentOrchestratorService } from '../services/payment-orchestrator.service';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.SUPER_ADMIN)
export class PaymentAdminController {
  constructor(private readonly orchestrator: PaymentOrchestratorService) {}

  @Get()
  async listPayments(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('orderId') orderId?: string,
  ) {
    const data = await this.orchestrator.listPaymentsForAdmin({
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(100, Math.max(1, Number(limit) || 20)),
      status,
      orderId,
    });

    return {
      success: true,
      message: 'Payments fetched successfully',
      data,
    };
  }

  @Get(':paymentId')
  async getPayment(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    const data = await this.orchestrator.getPaymentAdminDetail(paymentId);

    return {
      success: true,
      message: 'Payment fetched successfully',
      data,
    };
  }
}
