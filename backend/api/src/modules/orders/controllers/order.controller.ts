import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { OrderOrchestratorService } from '../services/order-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.CUSTOMER)
export class OrderController {
  constructor(
    private readonly orchestrator: OrderOrchestratorService,
  ) {}

  /* ================================================= */
  /* INTERNAL HELPER                                   */
  /* ================================================= */

  private async getOwnedOrder(orderId: string, userId: string) {
    const order = await this.orchestrator.getOrderById(orderId);

    if (order.customerId !== userId) {
      throw new ForbiddenException('Unauthorized access');
    }

    return order;
  }

  /* ================================================= */
  /* GET ORDER BY ID                                   */
  /* ================================================= */

  @Get(':orderId')
  async getOrderById(
    @Param('orderId') orderId: string,
    @CurrentUser() user,
  ) {
    const order = await this.getOwnedOrder(orderId, user.actorId);

    return {
      success: true,
      code: 'ORDER_FETCHED',
      message: 'Order fetched successfully',
      data: order,
    };
  }

  /* ================================================= */
  /* CANCEL ORDER                                      */
  /* ================================================= */

  @Post(':orderId/cancel')
  async cancelOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user,
  ) {
    await this.getOwnedOrder(orderId, user.actorId);

    const data = await this.orchestrator.cancelOrder(orderId);

    return {
      success: true,
      code: 'ORDER_CANCELLED',
      message: 'Order cancelled successfully',
      data,
    };
  }
}
