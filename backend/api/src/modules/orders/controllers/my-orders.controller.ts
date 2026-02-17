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
