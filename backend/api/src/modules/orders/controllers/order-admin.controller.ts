import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ActorType } from '../../auth/domain/enums/actor-type.enum';

import { OrderOrchestratorService } from '../services/order-orchestrator.service';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.SUPER_ADMIN)
export class OrderAdminController {
  constructor(
    private readonly orchestrator: OrderOrchestratorService,
  ) {}

  @Get()
  async listOrders(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.orchestrator.listOrdersForAdmin({
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(100, Math.max(1, Number(limit) || 20)),
      status,
      search,
    });

    return {
      success: true,
      message: 'Orders fetched successfully',
      data,
    };
  }

  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string) {
    const data = await this.orchestrator.getOrderAdminDetail(orderId);

    return {
      success: true,
      message: 'Order fetched successfully',
      data,
    };
  }
}
