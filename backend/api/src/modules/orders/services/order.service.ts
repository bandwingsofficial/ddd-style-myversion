import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';
import { Decimal } from '@prisma/client/runtime/library';

import { OrderRepository } from '../repositories/order.repository';

import { Cart } from '../../cart/domain/models/cart.model';
import { SavedAddress } from '../../saved-address/domain/models/saved-address.model';

import { Order } from '../domain/models/order.model';
import { OrderItem } from '../domain/models/order-item.model';

import { OrderAddress } from '../domain/value-objects/order-address.vo';
import { Money } from '../domain/value-objects/money.vo';

import { ValidationError } from '../../../common/errors';

/* ================================================= */
/* HELPERS                                           */
/* ================================================= */

const toNumber = (d?: Decimal | null): number => (d == null ? 0 : Number(d));

@Injectable()
export class OrderService {
  constructor(private readonly orderRepo: OrderRepository) {}

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

  /* ================================================= */
  /* PARAM VALIDATION                                  */
  /* ================================================= */

  const { cart, address } = params ?? {};

  if (!cart) {
    throw new ValidationError('CART_REQUIRED', 'Cart is required');
  }

  if (!address) {
    throw new ValidationError('ADDRESS_REQUIRED', 'Address is required');
  }

  /* ================================================= */
  /* BUSINESS VALIDATION                               */
  /* ================================================= */

  if (!cart.customerId) {
    throw new ValidationError(
      'CART_INVALID_CUSTOMER',
      'Cart must belong to customer',
    );
  }

  if (!cart.items.length) {
    throw new ValidationError(
      'EMPTY_CART',
      'Cannot create order from empty cart',
    );
  }

  // 🔥 checkout must already lock cart
  if (cart.status !== 'LOCKED') {
    throw new ValidationError(
      'CART_NOT_LOCKED',
      'Cart must be locked before creating order',
    );
  }

  /* ================================================= */
  /* SNAPSHOT ID + ADDRESS                             */
  /* ================================================= */

  const orderId = uuid();

  const orderAddress = OrderAddress.create({
    label: address.label,
    addressText: address.addressText,
    latitude: address.latitude,
    longitude: address.longitude,
  });

  /* ================================================= */
  /* SNAPSHOT ITEMS                                    */
  /* ================================================= */

  const items = cart.items.map((item) =>
    OrderItem.create({
      id: uuid(),
      orderId,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      discountPrice: toNumber(item.discountPrice),
    }),
  );

  /* ================================================= */
  /* 🔥 COPY TOTALS FROM CART (SOURCE OF TRUTH)         */
  /* ================================================= */

  const {
    subtotal,
    discount,
    afterDiscountTotal,
    deliveryFee,
    grandTotal,
  } = cart;

  /* ================================================= */
  /* CREATE AGGREGATE                                  */
  /* ================================================= */

  const order = Order.createNew({
    id: orderId,
    customerId: cart.customerId!,
    outletId: cart.outletId,
    cartId: cart.id,
    address: orderAddress,

    subtotal: toNumber(subtotal),
    discount: toNumber(discount),
    afterDiscountTotal: toNumber(afterDiscountTotal),
    deliveryFee: toNumber(deliveryFee),
    grandTotal: toNumber(grandTotal),

    items,
  });

  /* ================================================= */
  /* PERSIST                                           */
  /* ================================================= */

  return this.orderRepo.create(order, tx);
}
}
