import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { OrderOrchestratorService } from '../../orders/services/order-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

@Controller('outlet-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.OUTLET_USER)
export class OutletOrderController {
  constructor(
    private readonly orderOrchestrator: OrderOrchestratorService,
  ) {}

  /* ================================================= */
  /* LIST ORDERS                                      */
  /* ================================================= */

  @Get()
  async getOrders(@CurrentUser() user: any) {
    if (!user?.outletId) {
      throw new ForbiddenException('Outlet not found');
    }

    const orders =
      await this.orderOrchestrator.getOutletOrders(user.outletId);

    return {
      success: true,
      code: 'OUTLET_ORDERS_FETCHED',
      message: 'Outlet orders fetched successfully',
      data: orders,
    };
  }

  /* ================================================= */
  /* 🔥 INTERNAL HELPER                                */
  /* ================================================= */

  private async assertOwnership(orderId: string, outletId: string) {
    const order = await this.orderOrchestrator.getOrderById(orderId);

    if (order.outletId !== outletId) {
      throw new ForbiddenException('Access denied for this order');
    }
  }

  /* ================================================= */
  /* ACCEPT (PAID → CONFIRMED)                         */
  /* ================================================= */

  @Post(':id/accept')
  async accept(@Param('id') id: string, @CurrentUser() user: any) {
    await this.assertOwnership(id, user.outletId);

    return this.orderOrchestrator.confirmOrder(id);
  }

  /* ================================================= */
  /* REJECT (→ CANCELLED)                              */
  /* ================================================= */

  @Post(':id/reject')
  async reject(@Param('id') id: string, @CurrentUser() user: any) {
    await this.assertOwnership(id, user.outletId);

    return this.orderOrchestrator.cancelOrder(id, {
      actorType: user.actorType,
      actorId: user.actorId,
    });
  }

  /* ================================================= */
  /* PREPARING                                         */
  /* ================================================= */

  @Post(':id/preparing')
  async preparing(@Param('id') id: string, @CurrentUser() user: any) {
    await this.assertOwnership(id, user.outletId);

    return this.orderOrchestrator.startPreparingOrder(id);
  }

  /* ================================================= */
  /* OUT FOR DELIVERY                                  */
  /* ================================================= */

  @Post(':id/out-for-delivery')
  async outForDelivery(@Param('id') id: string, @CurrentUser() user: any) {
    await this.assertOwnership(id, user.outletId);

    return this.orderOrchestrator.outForDeliveryOrder(id);
  }

  /* ================================================= */
  /* DELIVERED                                         */
  /* ================================================= */

  @Post(':id/delivered')
  async delivered(@Param('id') id: string, @CurrentUser() user: any) {
    await this.assertOwnership(id, user.outletId);

    return this.orderOrchestrator.deliverOrder(id);
  }
}
