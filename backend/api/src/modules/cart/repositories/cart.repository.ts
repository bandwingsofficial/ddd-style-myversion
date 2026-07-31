import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';
import { Prisma, CartItem as PrismaCartItem } from '@prisma/client';
import { Cart } from '../domain/models/cart.model';
import { CartItem } from '../domain/models/cart-item.model';
import { CartStatus } from '../domain/enums/cart-status.enum';
import { CartStatusMapper } from '../mappers/cart-status.mapper';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE                                            */
  /* ================================================= */

  async create(cart: Cart, tx?: PrismaTransaction): Promise<Cart> {
    const client = tx ?? this.prisma;

    const row = await client.cart.create({
      data: {
        id: cart.id,
        customerId: cart.customerId ?? null,
        sessionId: cart.sessionId ?? null,
        outletId: cart.outletId,
        status: CartStatusMapper.toPrisma(cart.status),
        currency: cart.currency,

        // 🔥 totals
        subtotal: cart.subtotal,
        discount: cart.discount,
        afterDiscountTotal: cart.afterDiscountTotal,
        deliveryFee: cart.deliveryFee,
        grandTotal: cart.grandTotal,
        itemCount: cart.itemCount,

        deliveryRuleId: cart.deliveryRuleId ?? null,
        deliveryRuleName: cart.deliveryRuleName ?? null,
        deliveryRuleMinimumOrderAmount: cart.deliveryRuleMinimumOrderAmount ?? null,
        isFreeDelivery: cart.isFreeDelivery,
        amountToFreeDelivery: cart.amountToFreeDelivery ?? null,

        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
        lockedAt: cart.lockedAt ?? null,
        expiresAt: cart.expiresAt ?? null,
      },
      include: { items: true },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  async findActiveByCustomerAndOutlet(
  customerId: string,
  outletId: string,
  tx?: PrismaTransaction,
): Promise<Cart | null> {
  const client = tx ?? this.prisma;

  const row = await client.cart.findFirst({
    where: {
      customerId,
      outletId,
      status: CartStatusMapper.toPrisma(CartStatus.ACTIVE),
    },
    orderBy: {
      createdAt: 'desc', // 🔥 always pick latest cart
    },
    include: { items: true },
  });

  return row ? this.toDomain(row) : null;
}

  /** ACTIVE or LOCKED — for checkout display and session recovery */
  async findOpenByCustomerAndOutlet(
    customerId: string,
    outletId: string,
    tx?: PrismaTransaction,
  ): Promise<Cart | null> {
    const client = tx ?? this.prisma;

    const row = await client.cart.findFirst({
      where: {
        customerId,
        outletId,
        status: {
          in: [
            CartStatusMapper.toPrisma(CartStatus.ACTIVE),
            CartStatusMapper.toPrisma(CartStatus.LOCKED),
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    return row ? this.toDomain(row) : null;
  }

  async findActiveBySessionAndOutlet(
  sessionId: string,
  outletId: string,
  tx?: PrismaTransaction,
): Promise<Cart | null> {
  const client = tx ?? this.prisma;

  const row = await client.cart.findFirst({
    where: {
      sessionId,
      outletId, // 🔥 REQUIRED (same fix as customer)
      status: CartStatusMapper.toPrisma(CartStatus.ACTIVE),
    },
    orderBy: {
      createdAt: 'desc', // 🔥 always latest
    },
    include: { items: true },
  });

  return row ? this.toDomain(row) : null;
}
  async findById(id: string, tx?: PrismaTransaction): Promise<Cart | null> {
    const client = tx ?? this.prisma;

    const row = await client.cart.findUnique({
      where: { id },
      include: { items: true },
    });

    return row ? this.toDomain(row) : null;
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  async update(cart: Cart, tx?: PrismaTransaction): Promise<Cart> {
    const client = tx ?? this.prisma;

    const row = await client.cart.update({
      where: { id: cart.id },
      data: {
        status: CartStatusMapper.toPrisma(cart.status),
        currency: cart.currency,

        // 🔥 totals
        subtotal: cart.subtotal,
        discount: cart.discount,
        afterDiscountTotal: cart.afterDiscountTotal,
        deliveryFee: cart.deliveryFee,
        grandTotal: cart.grandTotal,
        itemCount: cart.itemCount,

        deliveryRuleId: cart.deliveryRuleId ?? null,
        deliveryRuleName: cart.deliveryRuleName ?? null,
        deliveryRuleMinimumOrderAmount: cart.deliveryRuleMinimumOrderAmount ?? null,
        isFreeDelivery: cart.isFreeDelivery,
        amountToFreeDelivery: cart.amountToFreeDelivery ?? null,

        updatedAt: cart.updatedAt,
        lockedAt: cart.lockedAt ?? null,
        expiresAt: cart.expiresAt ?? null,
      },
      include: { items: true },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* DELETE                                            */
  /* ================================================= */

  async delete(id: string, tx?: PrismaTransaction): Promise<void> {
    const client = tx ?? this.prisma;

    await client.cart.delete({ where: { id } });
  }

  public mapToDomain(row: any): Cart {
  return this.toDomain(row);
}

  /* ================================================= */
  /* CART ITEM CRUD                                    */
  /* ================================================= */

  async upsertItem(item: CartItem, tx?: PrismaTransaction): Promise<CartItem> {
    const client = tx ?? this.prisma;

    const row = await client.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: item.cartId,
          productId: item.productId,
        },
      },
      update: {
        quantity: { set: item.quantity },
        lineTotal: item.getLineTotal(),
        updatedAt: item.updatedAt,
      },
      create: {
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPrice: item.discountPrice ?? null,
        lineTotal: item.getLineTotal(),
        productName: item.productName,
        productImage: item.productImage,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });

    return this.toItemDomain(row);
  }

  async updateItem(item: CartItem, tx?: PrismaTransaction): Promise<CartItem> {
    const client = tx ?? this.prisma;

    const row = await client.cartItem.update({
      where: { id: item.id },
      data: {
        quantity: { set: item.quantity },
        lineTotal: item.getLineTotal(),
        updatedAt: item.updatedAt,
      },
    });

    return this.toItemDomain(row);
  }

  async removeItem(
    cartId: string,
    productId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    await client.cartItem.deleteMany({ where: { cartId, productId } });
  }

  async clearItems(cartId: string, tx?: PrismaTransaction): Promise<void> {
    const client = tx ?? this.prisma;

    await client.cartItem.deleteMany({ where: { cartId } });
  }

  /* ================================================= */
  /* PRIVATE MAPPERS                                   */
  /* ================================================= */

  private toDomain(
    row: Prisma.CartGetPayload<{ include: { items: true } }>
  ): Cart {
    return Cart.rehydrate({
      id: row.id,
      customerId: row.customerId ?? undefined,
      sessionId: row.sessionId ?? undefined,
      outletId: row.outletId,
      status: CartStatusMapper.toDomain(row.status),
      currency: row.currency,

      subtotal: row.subtotal,
      discount: row.discount,
      afterDiscountTotal: row.afterDiscountTotal,
      deliveryFee: row.deliveryFee,
      grandTotal: row.grandTotal,
      itemCount: row.itemCount,

      deliveryRuleId: row.deliveryRuleId ?? null,
      deliveryRuleName: row.deliveryRuleName ?? null,
      deliveryRuleMinimumOrderAmount: row.deliveryRuleMinimumOrderAmount ?? null,
      isFreeDelivery: row.isFreeDelivery,
      amountToFreeDelivery: row.amountToFreeDelivery ?? null,

      items: row.items.map((i) => this.toItemDomain(i)),

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lockedAt: row.lockedAt ?? undefined,
      expiresAt: row.expiresAt ?? undefined,
    });
  }

  private toItemDomain(row: PrismaCartItem): CartItem {
  return CartItem.rehydrate({
    id: row.id,
    cartId: row.cartId,
    productId: row.productId,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    discountPrice: row.discountPrice ?? undefined,
    lineTotal: row.lineTotal, // ✅ FIXED
    productName: row.productName,
    productImage: row.productImage,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}
}
