import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';
import { Decimal } from '@prisma/client/runtime/library';

import { OrderRepository } from '../repositories/order.repository';
import { OrderEventRepository } from '../repositories/order-event.repository'; // ✅ NEW

import { Cart } from '../../cart/domain/models/cart.model';
import { SavedAddress } from '../../saved-address/domain/models/saved-address.model';

import { Order } from '../domain/models/order.model';
import { OrderItem } from '../domain/models/order-item.model';

import { OrderAddress } from '../domain/value-objects/order-address.vo';
import { Money } from '../domain/value-objects/money.vo';

import { ValidationError } from '../../../common/errors';
import { CartStatus } from '@/modules/cart/domain/enums/cart-status.enum';

/* ================================================= */
/* HELPERS                                           */
/* ================================================= */

const toNumber = (d?: Decimal | null): number => (d == null ? 0 : Number(d));

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly orderEventRepo: OrderEventRepository, // ✅ NEW
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

  /* ================================================= */
  /* GET OUTLET ORDERS                                 */
  async getOutletOrders(outletId: string): Promise<Order[]> {
    return this.orderRepo.findByOutlet(outletId);
  }
  /* ================================================= */
}
