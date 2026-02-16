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
import { OutletOrderResponseDto } from '../dtos/outlet-order-response.dto';

@Controller('outlet-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.OUTLET_USER)
export class OutletOrderController {
  constructor(
    private readonly orderOrchestrator: OrderOrchestratorService,
  ) {}

  private toDetailedResponse(order: any) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerFullName: order.customerFullName,
    customerId: order.customerId,

    address: {
      label: order.address.label,
      addressText: order.address.addressText,
      latitude: order.address.latitude,
      longitude: order.address.longitude,
    },

    subtotal: order.subtotal.toNumber(),
    discount: order.discount.toNumber(),
    afterDiscountTotal: order.afterDiscountTotal.toNumber(),
    deliveryFee: order.deliveryFee.toNumber(),
    grandTotal: order.grandTotal.toNumber(),
    itemCount: order.itemCount,

    status: order.status,

    items: order.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
      discountPrice: item.discountPrice?.toNumber(),
      totalPrice: item.totalPrice.toNumber(),
      createdAt: item.createdAt,
    })),

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

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
    data: orders.map(order => new OutletOrderResponseDto(order)),
  };
}

@Get(':id')
async getOrderById(
  @Param('id') id: string,
  @CurrentUser() user: any,
) {
  if (!user?.outletId) {
    throw new ForbiddenException('Outlet not found');
  }

  const order = await this.orderOrchestrator.getOrderById(id);

  if (!order || order.outletId !== user.outletId) {
    throw new ForbiddenException('Access denied for this order');
  }

  return {
    success: true,
    code: 'OUTLET_ORDER_FETCHED',
    message: 'Order fetched successfully',
    data: this.toDetailedResponse(order),
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
