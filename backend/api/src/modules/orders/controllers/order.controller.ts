import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { OrderOrchestratorService } from '../services/order-orchestrator.service';
import { OrderResponseMapper } from '../mappers/order-response.mapper';
import { OrderPendingService } from '../services/order-pending.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';
import { ValidationError } from '../../../common/errors';
import { OrderStatus } from '../domain/enums/order-status.enum';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.CUSTOMER)
export class OrderController {
  constructor(
    private readonly orchestrator: OrderOrchestratorService,
    private readonly orderResponseMapper: OrderResponseMapper,
    private readonly orderPendingService: OrderPendingService,
  ) {}

  private async getOwnedOrder(orderId: string, userId: string) {
    await this.orderPendingService.expirePendingOrdersForCustomer(userId);

    const order = await this.orchestrator.getOrderById(orderId);

    if (order.customerId !== userId) {
      throw new ForbiddenException('Unauthorized access');
    }

    return order;
  }

  @Get(':orderId')
  async getOrderById(
    @Param('orderId') orderId: string,
    @CurrentUser() user: { actorId: string },
  ) {
    const order = await this.getOwnedOrder(orderId, user.actorId);

    return {
      success: true,
      code: 'ORDER_FETCHED',
      message: 'Order fetched successfully',
      data: await this.orderResponseMapper.toCustomerOrderResponse(order),
    };
  }

  @Post(':orderId/cancel')
  async cancelOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user: { actorId: string },
  ) {
    const order = await this.getOwnedOrder(orderId, user.actorId);

    if (order.status !== OrderStatus.PAYMENT_PENDING) {
      throw new ValidationError(
        'ORDER_NOT_CANCELLABLE',
        'Only unpaid orders can be cancelled from checkout',
      );
    }

    const cancelled = await this.orchestrator.cancelOrder(orderId, {
      actorType: ActorType.CUSTOMER,
      actorId: user.actorId,
    });

    return {
      success: true,
      code: 'ORDER_CANCELLED',
      message: 'Order cancelled successfully',
      data: await this.orderResponseMapper.toCustomerOrderResponse(cancelled),
    };
  }
}
