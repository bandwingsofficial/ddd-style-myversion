import { Controller, Get, UseGuards } from '@nestjs/common';

import { OrderOrchestratorService } from '../services/order-orchestrator.service';
import { OrderResponseMapper } from '../mappers/order-response.mapper';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

@Controller('my-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.CUSTOMER)
export class MyOrdersController {
  constructor(
    private readonly orchestrator: OrderOrchestratorService,
    private readonly orderResponseMapper: OrderResponseMapper,
  ) {}

  @Get()
  async getMyOrders(@CurrentUser() user: { actorId: string }) {
    const orders = await this.orchestrator.getCustomerOrders(user.actorId);

    return {
      success: true,
      code: 'MY_ORDERS_FETCHED',
      message: 'Orders fetched successfully',
      data: await Promise.all(
        orders.map((order) =>
          this.orderResponseMapper.toCustomerOrderResponse(order),
        ),
      ),
    };
  }
}
