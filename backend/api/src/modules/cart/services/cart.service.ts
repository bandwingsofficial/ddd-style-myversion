import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Cart } from '../domain/models/cart.model';
import { CartItem } from '../domain/models/cart-item.model';
import { CartStatus } from '../domain/enums/cart-status.enum';

import { CartRepository } from '../repositories/cart.repository';

import { ValidationError } from '../../../common/errors';
import { Prisma } from '@prisma/client';

const Decimal = Prisma.Decimal;

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartRepo: CartRepository,
  ) {}

  /* ================================================= */
  /* 🔥 TOTALS CALCULATOR                              */
  /* ================================================= */

private async recalcTotals(
  cartId: string,
  tx: PrismaTransaction,
): Promise<Cart> {
  const cart = await this.cartRepo.findById(cartId, tx);
  if (!cart) {
    throw new ValidationError('CART_NOT_FOUND', 'Cart not found');
  }

  let subtotal = new Decimal(0);              // MRP total
  let afterDiscountTotal = new Decimal(0);    // payable items total
  let itemCount = 0;

  for (const item of cart.items) {
    const unitTotal = item.unitPrice.mul(item.quantity);
    const lineTotal = item.getLineTotal(); // 🔥 already uses discount price

    subtotal = subtotal.add(unitTotal);
    afterDiscountTotal = afterDiscountTotal.add(lineTotal);
    itemCount += item.quantity;
  }

  const discount = subtotal.sub(afterDiscountTotal);

  const deliveryFee = itemCount > 0
    ? new Decimal(30)
    : new Decimal(0);

  const grandTotal = afterDiscountTotal.add(deliveryFee);

  const updated = Cart.rehydrate({
    id: cart.id,
    customerId: cart.customerId,
    sessionId: cart.sessionId,
    outletId: cart.outletId,
    status: cart.status,
    items: [...cart.items],
    currency: cart.currency,

    subtotal,
    discount,
    afterDiscountTotal,
    deliveryFee,
    grandTotal,
    itemCount,

    createdAt: cart.createdAt,
    updatedAt: new Date(),
    lockedAt: cart.lockedAt,
    expiresAt: cart.expiresAt,
  });

  return this.cartRepo.update(updated, tx);
}

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  async getActiveCart(params, tx?: PrismaTransaction) {
  const client = tx ?? this.prisma;

  const cart =
    params.customerId
      ? await this.cartRepo.findActiveByCustomerId(params.customerId, client)
      : await this.cartRepo.findActiveBySessionId(params.sessionId!, client);

  if (!cart) return null;

  /* 🔥 ALWAYS refresh totals */
  return this.recalcTotals(cart.id, client);
}
  /* ================================================= */
  /* INTERNAL GET OR CREATE                            */
  /* ================================================= */

  private async getOrCreateActiveCart(
    params: {
      customerId?: string;
      sessionId?: string;
      outletId: string;
    },
    tx: PrismaTransaction,
  ): Promise<Cart> {
    let cart = await this.getActiveCart(params, tx);

    if (cart) return cart;

    const newCart = Cart.createNew({
      id: uuid(),
      customerId: params.customerId,
      sessionId: params.sessionId,
      outletId: params.outletId,
    });

    return this.cartRepo.create(newCart, tx);
  }

  /* ================================================= */
  /* ADD ITEM                                          */
  /* ================================================= */

async addItem(
  params: {
    customerId?: string;
    sessionId?: string;
    outletId: string;
    product: { id: string };
    quantity: number;
  },
  tx?: PrismaTransaction,
): Promise<Cart> {

  const run = async (client: PrismaTransaction): Promise<Cart> => {
    if (params.quantity <= 0) {
      throw new ValidationError('INVALID_QUANTITY', 'Quantity must be > 0');
    }

    /* ---------------- fetch product ---------------- */

    const product = await client.product.findUnique({
      where: { id: params.product.id },
    });

    if (!product || product.status !== 'ACTIVE') {
      throw new ValidationError('PRODUCT_NOT_AVAILABLE', 'Product not available');
    }

    /* ---------------- cart ---------------- */

    const cart = await this.getOrCreateActiveCart(params, client);

    /* ---------------- check existing item ---------------- */

    const existing = cart.items.find(i => i.productId === product.id);

    let item: CartItem;

    if (existing) {
      item = existing.increaseQuantity(params.quantity);
    } else {
      item = CartItem.createNew({
        id: uuid(),
        cartId: cart.id,
        productId: product.id,
        quantity: params.quantity,
        unitPrice: product.originalPrice,
        discountPrice: product.discountPrice ?? undefined,
        productName: product.productName,
        productImage: product.mainImage,
      });
    }

    /* ---------------- atomic writes ---------------- */

    await this.cartRepo.upsertItem(item, client);

    return this.recalcTotals(cart.id, client);
  };

  // 🔥 key logic
  return tx ? run(tx) : this.prisma.$transaction(run);
}
  /* ================================================= */
  /* UPDATE QTY                                        */
  /* ================================================= */

  async updateItemQuantity(
  params: {
    customerId?: string;
    sessionId?: string;
    productId: string;
    quantity: number;
  },
  tx?: PrismaTransaction,
): Promise<Cart> {

  const run = async (client: PrismaTransaction): Promise<Cart> => {

    const cart = await this.getActiveCart(params, client);
    if (!cart) {
      throw new ValidationError('CART_NOT_FOUND', 'Cart not found');
    }

    if (params.quantity < 0) {
      throw new ValidationError('INVALID_QUANTITY', 'Quantity cannot be negative');
    }

    /* ---------------- remove ---------------- */

    if (params.quantity === 0) {
      await this.cartRepo.removeItem(cart.id, params.productId, client);
      return this.recalcTotals(cart.id, client);
    }

    /* ---------------- update ---------------- */

    const item = cart.items.find((i) => i.productId === params.productId);

    if (!item) {
      throw new ValidationError('CART_ITEM_NOT_FOUND', 'Item not found in cart');
    }

    const updated = item.updateQuantity(params.quantity);

    await this.cartRepo.updateItem(updated, client);

    return this.recalcTotals(cart.id, client);
  };

  // 🔥 atomic wrapper
  return tx ? run(tx) : this.prisma.$transaction(run);
}
  /* ================================================= */
  /* REMOVE ITEM                                       */
  /* ================================================= */

async removeItem(
  params: {
    customerId?: string;
    sessionId?: string;
    productId: string;
  },
  tx?: PrismaTransaction,
): Promise<Cart> {

  const run = async (client: PrismaTransaction): Promise<Cart> => {

    if (!params.productId) {
      throw new ValidationError('PRODUCT_ID_REQUIRED', 'Product id required');
    }

    const cart = await this.getActiveCart(params, client);
    if (!cart) {
      throw new ValidationError('CART_NOT_FOUND', 'Cart not found');
    }

    const exists = cart.items.some(i => i.productId === params.productId);

    if (!exists) {
      throw new ValidationError('CART_ITEM_NOT_FOUND', 'Item not found in cart');
    }

    await this.cartRepo.removeItem(cart.id, params.productId, client);

    return this.recalcTotals(cart.id, client);
  };

  // 🔥 atomic wrapper
  return tx ? run(tx) : this.prisma.$transaction(run);
}

  /* ================================================= */
  /* CLEAR                                             */
  /* ================================================= */

async clearCart(
  params: {
    customerId?: string;
    sessionId?: string;
  },
  tx?: PrismaTransaction,
): Promise<Cart> {

  const run = async (client: PrismaTransaction): Promise<Cart> => {

    const cart = await this.getActiveCart(params, client);

    if (!cart) {
      throw new ValidationError('CART_NOT_FOUND', 'Cart not found');
    }

    if (!cart.canBeModified()) {
      throw new ValidationError('CART_LOCKED', 'Cart cannot be modified');
    }

    await this.cartRepo.clearItems(cart.id, client);

    return this.recalcTotals(cart.id, client);
  };

  // 🔥 atomic wrapper
  return tx ? run(tx) : this.prisma.$transaction(run);
}

  /* ================================================= */
  /* LOCK                                              */
  /* ================================================= */

async lockCart(
  params: {
    customerId?: string;
    sessionId?: string;
  },
  tx?: PrismaTransaction,
): Promise<Cart> {

  const run = async (client: PrismaTransaction): Promise<Cart> => {

    const cart = await this.getActiveCart(params, client);

    if (!cart) {
      throw new ValidationError('CART_NOT_FOUND', 'Cart not found');
    }

    if (cart.status !== CartStatus.ACTIVE) {
      return cart;
    }

    if (!cart.hasItems()) {
      throw new ValidationError('CART_EMPTY', 'Cannot checkout empty cart');
    }

    /* ============================= */
    /* 🔥 PRICE + PRODUCT VALIDATION */
    /* ============================= */

    for (const item of cart.items) {
      const product = await client.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.status !== 'ACTIVE') {
        throw new ValidationError(
          'PRODUCT_NOT_AVAILABLE',
          `${item.productName} is unavailable`,
        );
      }

      // optional strict price check
      if (
        !item.unitPrice.equals(product.originalPrice) ||
        (item.discountPrice &&
          !item.discountPrice.equals(product.discountPrice))
      ) {
        throw new ValidationError(
          'PRICE_CHANGED',
          `${item.productName} price changed. Please refresh cart`,
        );
      }
    }

    /* ============================= */
    /* 🔥 SNAPSHOT TOTALS            */
    /* ============================= */

    const fresh = await this.recalcTotals(cart.id, client);

    const locked = fresh.lock(); // freeze

    return this.cartRepo.update(locked, client);
  };

  return tx ? run(tx) : this.prisma.$transaction(run);
}

async unlockCart(
  params: { customerId?: string; sessionId?: string },
  tx?: PrismaTransaction,
): Promise<Cart | null> {
  const run = async (client: PrismaTransaction) => {
    const cart = await this.getActiveCart(params, client);
    if (!cart) return null;

    const unlocked = cart.unlock(); // implement in domain
    return this.cartRepo.update(unlocked, client);
  };

  return tx ? run(tx) : this.prisma.$transaction(run);
}



}