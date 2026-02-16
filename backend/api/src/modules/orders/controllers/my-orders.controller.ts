import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { OrderOrchestratorService } from '../services/order-orchestrator.service';

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
  ) {}

  /* ================================================= */
  /* RESPONSE MAPPER                                   */
  /* ================================================= */

  private toResponse(order: any) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      itemCount: order.itemCount,
      grandTotal: order.grandTotal.toNumber(),
      createdAt: order.createdAt,
    };
  }

  /* ================================================= */
  /* GET CUSTOMER ORDERS                               */
  /* ================================================= */

  @Get()
  async getMyOrders(
    @CurrentUser() user: { actorId: string },
  ) {
    const orders = await this.orchestrator.getCustomerOrders(
      user.actorId,
    );

    return {
      success: true,
      code: 'MY_ORDERS_FETCHED',
      message: 'Orders fetched successfully',
      data: orders.map((order) => this.toResponse(order)),
    };
  }
}
