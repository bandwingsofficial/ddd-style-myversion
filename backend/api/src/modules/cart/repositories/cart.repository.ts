// src/modules/cart/repositories/cart.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Cart } from '../domain/models/cart.model';
import { CartItem } from '../domain/models/cart-item.model';
import { CartStatus } from '../domain/enums/cart-status.enum';
import { CartStatusMapper } from '../mappers/cart-status.mapper';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE                                           */
  /* ================================================= */

  async create(
    cart: Cart,
    tx?: PrismaTransaction,
  ): Promise<Cart> {
    const client = tx ?? this.prisma;

    const row = await client.cart.create({
      data: {
        id: cart.id,
        customerId: cart.customerId ?? null,
        outletId: cart.outletId,
        status: CartStatusMapper.toPrisma(cart.status),
        currency: cart.currency,
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
  /* READ (ACTIVE CART BY CUSTOMER)                    */
  /* ================================================= */

  async findActiveByCustomerId(
    customerId: string,
    tx?: PrismaTransaction,
  ): Promise<Cart | null> {
    const row = await (tx ?? this.prisma).cart.findFirst({
      where: {
        customerId,
        status: CartStatusMapper.toPrisma(CartStatus.ACTIVE),
      },
      include: { items: true },
    });

    return row ? this.toDomain(row) : null;
  }

  /* ================================================= */
  /* READ (BY ID)                                     */
  /* ================================================= */

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<Cart | null> {
    const row = await (tx ?? this.prisma).cart.findUnique({
      where: { id },
      include: { items: true },
    });

    return row ? this.toDomain(row) : null;
  }

  /* ================================================= */
  /* UPDATE (FULL AGGREGATE)                           */
  /* ================================================= */

  async update(
    cart: Cart,
    tx?: PrismaTransaction,
  ): Promise<Cart> {
    const client = tx ?? this.prisma;

    const row = await client.cart.update({
      where: { id: cart.id },
      data: {
        status: CartStatusMapper.toPrisma(cart.status),
        updatedAt: cart.updatedAt,
        lockedAt: cart.lockedAt ?? null,
        expiresAt: cart.expiresAt ?? null,
      },
      include: { items: true },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* DELETE (CLEAR CART)                               */
  /* ================================================= */

  async delete(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    await client.cart.delete({
      where: { id },
    });
  }

  /* ================================================= */
  /* CART ITEM CRUD                                   */
  /* ================================================= */

  async addItem(
    item: CartItem,
    tx?: PrismaTransaction,
  ): Promise<CartItem> {
    const row = await (tx ?? this.prisma).cartItem.create({
      data: {
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPrice: item.discountPrice ?? null,
        productName: item.productName,
        productImage: item.productImage,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });

    return this.toItemDomain(row);
  }

  async updateItem(
    item: CartItem,
    tx?: PrismaTransaction,
  ): Promise<CartItem> {
    const row = await (tx ?? this.prisma).cartItem.update({
      where: { id: item.id },
      data: {
        quantity: item.quantity,
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
    await (tx ?? this.prisma).cartItem.delete({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });
  }

  async clearItems(
    cartId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    await (tx ?? this.prisma).cartItem.deleteMany({
      where: { cartId },
    });
  }

  /* ================================================= */
  /* PRIVATE MAPPERS                                  */
  /* ================================================= */

  private toDomain(row: any): Cart {
    return Cart.rehydrate({
      id: row.id,
      customerId: row.customerId ?? undefined,
      outletId: row.outletId,
      status: CartStatusMapper.toDomain(row.status),
      currency: row.currency,
      items: row.items.map((item: any) =>
        this.toItemDomain(item),
      ),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lockedAt: row.lockedAt ?? undefined,
      expiresAt: row.expiresAt ?? undefined,
    });
  }

  private toItemDomain(row: any): CartItem {
    return CartItem.rehydrate({
      id: row.id,
      cartId: row.cartId,
      productId: row.productId,
      quantity: row.quantity,
      unitPrice: Number(row.unitPrice),
      discountPrice: row.discountPrice
        ? Number(row.discountPrice)
        : undefined,
      productName: row.productName,
      productImage: row.productImage,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
    