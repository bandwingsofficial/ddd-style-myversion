import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';

import { OrderOrchestratorService } from '../../orders/services/order-orchestrator.service';
import { PaymentRepository } from '../../payments/repositories/payment.repository';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';
import { OutletOrderResponseDto } from '../dtos/outlet-order-response.dto';
import { mapOrderCustomerDto } from '../../../common/utils/customer-display.util';

@Controller('outlet-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.OUTLET_USER)
export class OutletOrderController {
  constructor(
    private readonly orderOrchestrator: OrderOrchestratorService,
    private readonly paymentRepo: PaymentRepository,
  ) {}

  private async toDetailedResponse(order: any) {
    const latestPayment = await this.paymentRepo.findLatestByOrderId(order.id);
    const customer = mapOrderCustomerDto({
      id: order.customerId,
      fullName: order.customerFullName,
      phone: order.customerPhone,
      email: order.customerEmail,
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
      },
      customerFullName: customer.displayName,
      customerId: order.customerId,

      address: {
        label: order.address.getLabel(),
        addressText: order.address.getAddressText(),
        houseNumber: order.address.getHouseNumber() ?? null,
        street: order.address.getStreet() ?? null,
        landmark: order.address.getLandmark() ?? null,
        pincode: order.address.getPincode() ?? null,
        latitude: order.address.getLatitude() ?? null,
        longitude: order.address.getLongitude() ?? null,
      },

      subtotal: order.subtotal.toNumber(),
      discount: order.discount.toNumber(),
      afterDiscountTotal: order.afterDiscountTotal.toNumber(),
      netSubtotal: order.afterDiscountTotal.toNumber(),
      deliveryFee: order.deliveryFee.toNumber(),
      grandTotal: order.grandTotal.toNumber(),
      itemCount: order.itemCount,

      status: order.status,
      paymentStatus: OutletOrderResponseDto.resolvePaymentStatus(
        order.status,
        latestPayment,
      ),

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

  private hasHistoryQuery(params: {
    page?: string;
    status?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    return (
      params.page !== undefined ||
      Boolean(params.status?.trim()) ||
      Boolean(params.search?.trim()) ||
      Boolean(params.fromDate?.trim()) ||
      Boolean(params.toDate?.trim())
    );
  }

  /* ================================================= */
  /* LIST ORDERS                                      */
  /* ================================================= */

  @Get()
  async getOrders(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    if (!user?.outletId) {
      throw new ForbiddenException('Outlet not found');
    }

    // History / filtered list: server-side pagination
    if (this.hasHistoryQuery({ page, status, search, fromDate, toDate })) {
      const result = await this.orderOrchestrator.listOrdersForOutlet({
        outletId: user.outletId,
        page: Math.max(1, Number(page) || 1),
        limit: Math.min(100, Math.max(1, Number(limit) || 20)),
        status: status?.trim() || undefined,
        search: search?.trim() || undefined,
        fromDate: fromDate?.trim() || undefined,
        toDate: toDate?.trim() || undefined,
      });

      const paymentMap = await this.paymentRepo.findLatestByOrderIds(
        result.items.map((order) => order.id),
      );

      return {
        success: true,
        code: 'OUTLET_ORDERS_FETCHED',
        message: 'Outlet orders fetched successfully',
        data: {
          items: result.items.map(
            (order) =>
              new OutletOrderResponseDto(
                order,
                paymentMap.get(order.id) ?? null,
              ),
          ),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      };
    }

    // Live board: full list (existing behavior)
    const orders = await this.orderOrchestrator.getOutletOrders(user.outletId);

    const paymentMap = await this.paymentRepo.findLatestByOrderIds(
      orders.map((order) => order.id),
    );

    return {
      success: true,
      code: 'OUTLET_ORDERS_FETCHED',
      message: 'Outlet orders fetched successfully',
      data: orders.map(
        (order) =>
          new OutletOrderResponseDto(order, paymentMap.get(order.id) ?? null),
      ),
    };
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string, @CurrentUser() user: any) {
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
      data: await this.toDetailedResponse(order),
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
