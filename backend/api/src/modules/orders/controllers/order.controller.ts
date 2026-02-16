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
  /* RESPONSE MAPPER (API SAFE)                        */
  /* ================================================= */

  private toResponse(order: any) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerFullName: order.customerFullName,
      outletId: order.outletId,
      cartId: order.cartId,

      address: {
        label: order.address.label,
        type: order.address.type,
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
  /* GET ORDER BY ID                                   */
  /* ================================================= */

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
      data: this.toResponse(order),
    };
  }

  /* ================================================= */
  /* CANCEL ORDER                                      */
  /* ================================================= */

  @Post(':orderId/cancel')
  async cancelOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() user: { actorId: string },
  ) {
    await this.getOwnedOrder(orderId, user.actorId);

    const order = await this.orchestrator.cancelOrder(
      orderId,
      {
        actorType: ActorType.CUSTOMER,
        actorId: user.actorId,
      },
    );

    return {
      success: true,
      code: 'ORDER_CANCELLED',
      message: 'Order cancelled successfully',
      data: this.toResponse(order),
    };
  }
}
