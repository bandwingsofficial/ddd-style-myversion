import {
  Prisma,
  OrderStatus as PrismaOrderStatus,
} from '@prisma/client';

import { Order } from '../domain/models/order.model';
import { OrderItem } from '../domain/models/order-item.model';

import { OrderStatus } from '../domain/enums/order-status.enum';

import { Money } from '../domain/value-objects/money.vo';
import { OrderAddress } from '../domain/value-objects/order-address.vo';

/* ---------------------------------------------- */
/* TYPES                                          */
/* ---------------------------------------------- */

type PrismaOrderWithItems =
  Prisma.OrderGetPayload<{ include: { items: true } }>;

/* ---------------------------------------------- */
/* MAPPER                                         */
/* ---------------------------------------------- */

export class OrderMapper {
  /* ---------------------------------------------- */
  /* TO DOMAIN                                      */
  /* ---------------------------------------------- */

  static toDomain(order: PrismaOrderWithItems): Order {
  if (!order.items || order.items.length === 0) {
    throw new Error(
      `Order ${order.id} has no items. DB corruption or invalid state.`,
    );
  }

  return Order.rehydrate({
    id: order.id,

    customerId: order.customerId,
    outletId: order.outletId,

    cartId: order.cartId ?? undefined,

    address: OrderAddress.create({
      label: order.addressLabel,
      addressText: order.addressText,
      latitude: order.latitude ?? undefined,
      longitude: order.longitude ?? undefined,
    }),

    subtotal: Money.create(Number(order.subtotal)),
    discount: Money.create(Number(order.discount)),
    afterDiscountTotal: Money.create(Number(order.afterDiscountTotal)),
    deliveryFee: Money.create(Number(order.deliveryFee)),
    grandTotal: Money.create(Number(order.grandTotal)), // ✅ FIXED

    itemCount: order.itemCount,

    status: this.toDomainStatus(order.status),

    items: order.items.map((item) =>
      OrderItem.rehydrate({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        unitPrice: Money.create(Number(item.unitPrice)),
        discountPrice: item.discountPrice
          ? Money.create(Number(item.discountPrice))
          : undefined,
        totalPrice: Money.create(Number(item.totalPrice)),
        createdAt: item.createdAt,
      }),
    ),

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
}

  /* ---------------------------------------------- */
/* TO PRISMA (CREATE)                              */
/* ---------------------------------------------- */

static toPrismaCreate(order: Order): Prisma.OrderCreateInput {
  return {
    id: order.id,

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,

    customer: {
      connect: { id: order.customerId },
    },

    outlet: {
      connect: { id: order.outletId },
    },

    cart: order.cartId
      ? {
          connect: { id: order.cartId },
        }
      : undefined,

    /* -------- address snapshot -------- */

    addressLabel: order.address.getLabel(),
    addressText: order.address.getAddressText(),
    latitude: order.address.getLatitude(),
    longitude: order.address.getLongitude(),

    /* -------- money snapshot (🔥 FULL FIX) -------- */

    subtotal: order.subtotal.toNumber(),
    discount: order.discount.toNumber(),
    afterDiscountTotal: order.afterDiscountTotal.toNumber(),
    deliveryFee: order.deliveryFee.toNumber(),
    grandTotal: order.grandTotal.toNumber(),   // ✅ renamed
    itemCount: order.itemCount,                // ✅ added

    status: this.toPrismaStatus(order.status),

    /* -------- items snapshot -------- */

    items: {
      create: order.items.map((item) => ({
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
    },
  };
}
  /* ---------------------------------------------- */
  /* STATUS MAPPING                                 */
  /* ---------------------------------------------- */

  private static toDomainStatus(
    status: PrismaOrderStatus,
  ): OrderStatus {
    switch (status) {
      case PrismaOrderStatus.CREATED:
        return OrderStatus.CREATED;
      case PrismaOrderStatus.PAYMENT_PENDING:
        return OrderStatus.PAYMENT_PENDING;
      case PrismaOrderStatus.PAID:
        return OrderStatus.PAID;
      case PrismaOrderStatus.CONFIRMED:
        return OrderStatus.CONFIRMED;
      case PrismaOrderStatus.PREPARING:
        return OrderStatus.PREPARING;
      case PrismaOrderStatus.OUT_FOR_DELIVERY:
        return OrderStatus.OUT_FOR_DELIVERY;
      case PrismaOrderStatus.DELIVERED:
        return OrderStatus.DELIVERED;
      case PrismaOrderStatus.CANCELLED:
        return OrderStatus.CANCELLED;
      case PrismaOrderStatus.FAILED:
        return OrderStatus.FAILED;
      default:
        throw new Error(`Unknown Prisma OrderStatus: ${status}`);
    }
  }

  static toPrismaStatus(
  status: OrderStatus,
): PrismaOrderStatus {
  switch (status) {
    case OrderStatus.CREATED:
    case OrderStatus.PAYMENT_PENDING:
    case OrderStatus.PAID:
    case OrderStatus.CONFIRMED:
    case OrderStatus.PREPARING:
    case OrderStatus.OUT_FOR_DELIVERY:
    case OrderStatus.DELIVERED:
    case OrderStatus.CANCELLED:
    case OrderStatus.FAILED:
      return status;

    default:
      throw new Error(`Unknown Domain OrderStatus: ${status}`);
  }
}
}
