import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';
import { Decimal } from '@prisma/client/runtime/library';

import { OrderRepository } from '../repositories/order.repository';
import { OrderEventRepository } from '../repositories/order-event.repository';
import { OrderResponseMapper } from '../mappers/order-response.mapper';

import { Cart } from '../../cart/domain/models/cart.model';
import { SavedAddress } from '../../saved-address/domain/models/saved-address.model';

import { Order } from '../domain/models/order.model';
import { OrderItem } from '../domain/models/order-item.model';

import { OrderAddress } from '../domain/value-objects/order-address.vo';
import { Money } from '../domain/value-objects/money.vo';

import { ValidationError } from '../../../common/errors';
import { traceOutletLifecycle } from '../../../common/utils/outlet-trace.util';
import { CartStatus } from '@/modules/cart/domain/enums/cart-status.enum';
import { OrderStatus } from '../domain/enums/order-status.enum';
import { OrderMapper } from '../mappers/order.mapper';

/* ================================================= */
/* HELPERS                                           */
/* ================================================= */

const toNumber = (d?: Decimal | null): number => (d == null ? 0 : Number(d));

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderRepo: OrderRepository,
    private readonly orderEventRepo: OrderEventRepository,
    private readonly orderResponseMapper: OrderResponseMapper,
  ) {}

  /* ================================================= */
  /* READS                                            */
  /* ================================================= */

  async getById(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      throw new ValidationError('ORDER_NOT_FOUND', 'Order not found');
    }

    return order;
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return this.orderRepo.findAllByCustomer(customerId);
  }

  async listForAdmin(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    return this.orderRepo.findAllForAdmin(params);
  }

  async getAdminDetail(orderId: string) {
    const row = await this.orderRepo.findAdminDetailRow(orderId);

    if (!row) {
      throw new ValidationError('ORDER_NOT_FOUND', 'Order not found');
    }

    return this.orderResponseMapper.toAdminDetailResponse(row);
  }

  /* ================================================= */
  /* CREATE FROM CART (MAIN CHECKOUT ENTRY)            */
  /* ================================================= */

  async createFromCart(
  params: {
    cart: Cart;
    address: SavedAddress;
  },
  tx?: PrismaTransaction,
): Promise<Order> {
  const { cart, address } = params ?? {};

  if (!cart) {
    throw new ValidationError('CART_REQUIRED', 'Cart is required');
  }

  if (!address) {
    throw new ValidationError('ADDRESS_REQUIRED', 'Address is required');
  }

  if (!cart.customerId) {
    throw new ValidationError(
      'CART_INVALID_CUSTOMER',
      'Cart must belong to customer',
    );
  }

  if (!cart.hasItems()) {
    throw new ValidationError(
      'EMPTY_CART',
      'Cannot create order from empty cart',
    );
  }

  if (cart.status !== CartStatus.LOCKED) {
    throw new ValidationError(
      'CART_NOT_LOCKED',
      'Cart must be locked before creating order',
    );
  }

  traceOutletLifecycle('order.createFromCart', {
    cartOutletId: cart.outletId,
    cartId: cart.id,
    customerId: cart.customerId ?? null,
  });

  const orderId = uuid();

  const orderAddress = OrderAddress.create({
    label: address.label,
    addressText: address.addressText,
    latitude: address.latitude,
    longitude: address.longitude,
  });

  /* 🔥 SNAPSHOT ITEMS */
  const items = cart.items.map((item) =>
    OrderItem.create({
      id: uuid(),
      orderId,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      discountPrice:
        item.discountPrice != null
          ? toNumber(item.discountPrice)
          : undefined,
    }),
  );

  /* 🔥 SNAPSHOT TOTALS (NO RECALC EVER) */
  const order = Order.createNew({
    id: orderId,
    customerId: cart.customerId!,
    outletId: cart.outletId,
    cartId: cart.id,
    address: orderAddress,
    subtotal: toNumber(cart.subtotal),
    discount: toNumber(cart.discount),
    afterDiscountTotal: toNumber(cart.afterDiscountTotal),
    deliveryFee: toNumber(cart.deliveryFee),
    grandTotal: toNumber(cart.grandTotal),
    itemCount: cart.itemCount,

    deliveryRuleId: cart.deliveryRuleId ?? null,
    deliveryRuleName: cart.deliveryRuleName ?? null,
    deliveryRuleMinimumOrderAmount:
      cart.deliveryRuleMinimumOrderAmount != null
        ? toNumber(cart.deliveryRuleMinimumOrderAmount)
        : null,
    isFreeDelivery: cart.isFreeDelivery,
    items,
  });

  const saved = await this.orderRepo.create(order, tx);

  await this.orderEventRepo.create(
    {
      orderId: saved.id,
      type: 'CREATED',
      metadata: { source: 'checkout' },
    },
    tx,
  );

  return saved;
}

  /**
   * Refresh a PAYMENT_PENDING order snapshot from the current locked cart.
   * Ensures Razorpay amount matches the latest checkout totals on retry.
   */
  async resyncPendingOrderFromCart(
    params: {
      orderId: string;
      cart: Cart;
      address: SavedAddress;
    },
    tx?: PrismaTransaction,
  ): Promise<Order> {
    const run = async (client: PrismaTransaction): Promise<Order> => {
      const existing = await this.orderRepo.findById(params.orderId, client);

      if (!existing) {
        throw new ValidationError('ORDER_NOT_FOUND', 'Order not found');
      }

      if (existing.status !== OrderStatus.PAYMENT_PENDING) {
        throw new ValidationError(
          'ORDER_NOT_RESYNCABLE',
          'Only payment-pending orders can be resynced from cart',
        );
      }

      if (!params.cart.hasItems()) {
        throw new ValidationError('EMPTY_CART', 'Cart is empty');
      }

      if (params.cart.outletId !== existing.outletId) {
        traceOutletLifecycle('order.resyncPendingOrderFromCart', {
          orderOutletId: existing.outletId,
          cartOutletId: params.cart.outletId,
          orderId: existing.id,
        });
        throw new ValidationError(
          'OUTLET_ORDER_MISMATCH',
          'Cart outlet does not match pending order outlet',
        );
      }

      const { cart, address } = params;

      await client.orderItem.deleteMany({
        where: { orderId: existing.id },
      });

      const itemRows = cart.items.map((item) => ({
        id: uuid(),
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice),
        discountPrice:
          item.discountPrice != null ? toNumber(item.discountPrice) : null,
        totalPrice: toNumber(item.getLineTotal()),
      }));

      const deliveryFee = toNumber(cart.deliveryFee);

      const row = await client.order.update({
        where: { id: existing.id },
        data: {
          cartId: cart.id,
          addressLabel: address.label,
          addressText: address.addressText,
          latitude: address.latitude ?? null,
          longitude: address.longitude ?? null,
          subtotal: toNumber(cart.subtotal),
          discount: toNumber(cart.discount),
          afterDiscountTotal: toNumber(cart.afterDiscountTotal),
          deliveryFee,
          grandTotal: toNumber(cart.grandTotal),
          itemCount: cart.itemCount,
          deliveryRuleId: cart.deliveryRuleId ?? null,
          deliveryRuleName: cart.deliveryRuleName ?? null,
          deliveryRuleMinimumOrderAmount:
            cart.deliveryRuleMinimumOrderAmount != null
              ? toNumber(cart.deliveryRuleMinimumOrderAmount)
              : null,
          isFreeDelivery: deliveryFee === 0,
          version: existing.version + 1,
          updatedAt: new Date(),
          items: {
            create: itemRows,
          },
        },
        include: {
          items: true,
          customer: {
            include: {
              profile: true,
            },
          },
        },
      });

      return OrderMapper.toDomain(row);
    };

    return tx ? run(tx) : this.prisma.$transaction(run);
  }

  /* ================================================= */
  /* GET OUTLET ORDERS                                 */
  async getOutletOrders(outletId: string): Promise<Order[]> {
    return this.orderRepo.findByOutlet(outletId);
  }
  /* ================================================= */
}
