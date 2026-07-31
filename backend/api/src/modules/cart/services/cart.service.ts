import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Cart } from '../domain/models/cart.model';
import { CartItem } from '../domain/models/cart-item.model';
import { CartStatus } from '../domain/enums/cart-status.enum';

import { CartRepository } from '../repositories/cart.repository';
import { DeliveryChargeService } from '../../delivery-config/services/delivery-charge.service';

import { ValidationError } from '../../../common/errors';
import { Prisma } from '@prisma/client';

const Decimal = Prisma.Decimal;

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartRepo: CartRepository,
    private readonly deliveryChargeService: DeliveryChargeService,
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

    let subtotal = new Decimal(0); // MRP total
    let afterDiscountTotal = new Decimal(0); // payable items total
    let itemCount = 0;

    for (const item of cart.items) {
      const unitTotal = item.unitPrice.mul(item.quantity);
      const lineTotal = item.getLineTotal(); // 🔥 already uses discount price

      subtotal = subtotal.add(unitTotal);
      afterDiscountTotal = afterDiscountTotal.add(lineTotal);
      itemCount += item.quantity;
    }

    const discount = subtotal.sub(afterDiscountTotal);
    const netSubtotal = afterDiscountTotal;

    const delivery = await this.deliveryChargeService.calculate({
      subtotal,
      discount,
      netSubtotal,
      itemCount,
    });

    const amountToFreeDelivery =
      delivery.remainingForFreeDelivery != null
        ? new Decimal(delivery.remainingForFreeDelivery)
        : null;

    const grandTotal = afterDiscountTotal.add(new Decimal(delivery.deliveryFee));

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
      deliveryFee: new Decimal(delivery.deliveryFee),
      grandTotal,
      itemCount,

      deliveryRuleId: delivery.deliveryRuleId,
      deliveryRuleName: delivery.deliveryRuleName,
      deliveryRuleMinimumOrderAmount: new Decimal(delivery.minimumOrderAmount),
      isFreeDelivery: delivery.deliveryFee === 0,
      amountToFreeDelivery,

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

  private async purgeInactiveItems(
    cart: Cart,
    tx: PrismaTransaction,
  ): Promise<number> {
    if (!cart.items.length) {
      return 0;
    }

    const products = await tx.product.findMany({
      where: {
        id: { in: cart.items.map((item) => item.productId) },
      },
      select: { id: true, status: true, isAvailable: true },
    });

    const productStatus = new Map(products.map((product) => [product.id, product.status]));
    const productAvailability = new Map(
      products.map((product) => [product.id, product.isAvailable]),
    );
    const inactiveProductIds = cart.items
      .filter((item) => {
        const status = productStatus.get(item.productId);
        const available = productAvailability.get(item.productId);
        return status !== 'ACTIVE' || available === false;
      })
      .map((item) => item.productId);

    if (inactiveProductIds.length === 0) {
      return 0;
    }

    for (const productId of inactiveProductIds) {
      await this.cartRepo.removeItem(cart.id, productId, tx);
    }

    return inactiveProductIds.length;
  }

  async syncActiveCart(
    params: {
      customerId?: string;
      sessionId?: string;
      outletId: string;
    },
    tx?: PrismaTransaction,
  ): Promise<{ cart: Cart | null; removedInactiveCount: number }> {
    const client = tx ?? this.prisma;

    const cart = params.customerId
      ? await this.cartRepo.findOpenByCustomerAndOutlet(
          params.customerId,
          params.outletId,
          client,
        )
      : await this.cartRepo.findActiveBySessionAndOutlet(
          params.sessionId!,
          params.outletId,
          client,
        );

    if (!cart) {
      return { cart: null, removedInactiveCount: 0 };
    }

    const removedInactiveCount = await this.purgeInactiveItems(cart, client);
    await this.refreshItemSnapshots(cart.id, client);
    const syncedCart = await this.recalcTotals(cart.id, client);

    return { cart: syncedCart, removedInactiveCount };
  }

  /**
   * Reload product snapshots (prices, names, images) on every cart sync.
   */
  private async refreshItemSnapshots(
    cartId: string,
    tx: PrismaTransaction,
  ): Promise<void> {
    const cart = await this.cartRepo.findById(cartId, tx);
    if (!cart?.items.length) {
      return;
    }

    for (const item of cart.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: {
          productName: true,
          mainImage: true,
          originalPrice: true,
          discountPrice: true,
          status: true,
          isAvailable: true,
        },
      });

      if (!product) {
        continue;
      }

      const unitPrice = product.originalPrice;
      const discountPrice = product.discountPrice ?? undefined;
      const effectivePrice = discountPrice ?? unitPrice;
      const lineTotal = effectivePrice.mul(item.quantity);

      const productImage =
        product.mainImage?.trim() || item.productImage?.trim() || '';
      const productName = product.productName?.trim() || item.productName;

      const refreshed = CartItem.rehydrate({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        discountPrice,
        lineTotal,
        productName,
        productImage,
        createdAt: item.createdAt,
        updatedAt: new Date(),
      });

      await this.cartRepo.upsertItem(refreshed, tx);
    }
  }

  async getActiveCart(
    params: {
      customerId?: string;
      sessionId?: string;
      outletId: string;
    },
    tx?: PrismaTransaction,
  ) {
    const { cart } = await this.syncActiveCart(params, tx);
    return cart;
  }
  /* ================================================= */
  /* INTERNAL GET OR CREATE                            */
  /* ================================================= */

  private async getOrCreateActiveCart(
    params: {
      customerId?: string;
      sessionId?: string;
      outletId: string;
      forceReplace?: boolean;
    },
    tx: PrismaTransaction,
  ): Promise<Cart> {
    const client = tx ?? this.prisma;

    /* ===================================== */
    /* 🔥 Step 1 — find ANY active cart      */
    /* ===================================== */

    const existingRow = await client.cart.findFirst({
      where: {
        OR: [
          { customerId: params.customerId ?? undefined },
          { sessionId: params.sessionId ?? undefined },
        ],
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    const existing = existingRow
      ? this.cartRepo.mapToDomain(existingRow)
      : null;

    /* ===================================== */
    /* 🔥 Step 2 — outlet mismatch           */
    /* ===================================== */

    if (existing && existing.outletId !== params.outletId) {
      if (!params.forceReplace) {
        throw new ValidationError(
          'OUTLET_MISMATCH',
          'Your cart contains items from another outlet. Replace cart?',
        );
      }

      await this.cartRepo.delete(existing.id, tx);
    }

    /* ===================================== */
    /* 🔥 Step 3 — get cart for this outlet  */
    /* ===================================== */

    const sameOutlet = params.customerId
      ? await this.cartRepo.findActiveByCustomerAndOutlet(
          params.customerId,
          params.outletId,
          tx,
        )
      : await this.cartRepo.findActiveBySessionAndOutlet(
          params.sessionId!,
          params.outletId,
          tx,
        );

    if (sameOutlet) return sameOutlet;

    /* ===================================== */
    /* 🔥 Step 4 — create new                */
    /* ===================================== */

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
      forceReplace?: boolean;
    },
    tx?: PrismaTransaction,
  ): Promise<Cart> {
    const run = async (client: PrismaTransaction): Promise<Cart> => {
      if (params.quantity <= 0) {
        throw new ValidationError('INVALID_QUANTITY', 'Quantity must be > 0');
      }

      const product = await client.product.findUnique({
        where: { id: params.product.id },
      });

      if (!product || product.status !== 'ACTIVE' || !product.isAvailable) {
        throw new ValidationError(
          'PRODUCT_NOT_AVAILABLE',
          'Product not available',
        );
      }

      const cart = await this.getOrCreateActiveCart(params, client);

      const existing = cart.items.find((i) => i.productId === product.id);

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
          productImage: product.mainImage?.trim() ?? '',
        });
      }

      await this.cartRepo.upsertItem(item, client);

      return this.recalcTotals(cart.id, client);
    };

    return tx ? run(tx) : this.prisma.$transaction(run);
  }
  /* ================================================= */
  /* UPDATE QTY                                        */
  /* ================================================= */

  async updateItemQuantity(
    params: {
      customerId?: string;
      sessionId?: string;
      outletId: string; // 🔥 REQUIRED
      productId: string;
      quantity: number;
    },
    tx?: PrismaTransaction,
  ): Promise<Cart> {
    const run = async (client: PrismaTransaction): Promise<Cart> => {
      /* 🔥 outlet-aware fetch */
      const cart = await this.getActiveCart(
        {
          customerId: params.customerId,
          sessionId: params.sessionId,
          outletId: params.outletId,
        },
        client,
      );

      if (!cart) {
        throw new ValidationError('CART_NOT_FOUND', 'Cart not found');
      }

      if (params.quantity < 0) {
        throw new ValidationError(
          'INVALID_QUANTITY',
          'Quantity cannot be negative',
        );
      }

      /* ---------------- remove ---------------- */

      if (params.quantity === 0) {
        await this.cartRepo.removeItem(cart.id, params.productId, client);
        return this.recalcTotals(cart.id, client);
      }

      /* ---------------- update ---------------- */

      const item = cart.items.find((i) => i.productId === params.productId);

      if (!item) {
        throw new ValidationError(
          'CART_ITEM_NOT_FOUND',
          'Item not found in cart',
        );
      }

      const updated = item.updateQuantity(params.quantity);

      await this.cartRepo.updateItem(updated, client);

      return this.recalcTotals(cart.id, client);
    };

    return tx ? run(tx) : this.prisma.$transaction(run);
  }
  /* ================================================= */
  /* REMOVE ITEM                                       */
  /* ================================================= */

  async removeItem(
    params: {
      customerId?: string;
      sessionId?: string;
      outletId: string; // 🔥 REQUIRED
      productId: string;
    },
    tx?: PrismaTransaction,
  ): Promise<Cart> {
    const run = async (client: PrismaTransaction): Promise<Cart> => {
      if (!params.productId) {
        throw new ValidationError('PRODUCT_ID_REQUIRED', 'Product id required');
      }

      /* 🔥 outlet-aware fetch */
      const cart = await this.getActiveCart(
        {
          customerId: params.customerId,
          sessionId: params.sessionId,
          outletId: params.outletId,
        },
        client,
      );

      if (!cart) {
        throw new ValidationError('CART_NOT_FOUND', 'Cart not found');
      }

      const exists = cart.items.some((i) => i.productId === params.productId);

      if (!exists) {
        throw new ValidationError(
          'CART_ITEM_NOT_FOUND',
          'Item not found in cart',
        );
      }

      await this.cartRepo.removeItem(cart.id, params.productId, client);

      return this.recalcTotals(cart.id, client);
    };

    return tx ? run(tx) : this.prisma.$transaction(run);
  }

  /* ================================================= */
  /* CLEAR                                             */
  /* ================================================= */

  async clearCart(
    params: {
      customerId?: string;
      sessionId?: string;
      outletId: string; // 🔥 REQUIRED
    },
    tx?: PrismaTransaction,
  ): Promise<Cart> {
    const run = async (client: PrismaTransaction): Promise<Cart> => {
      /* 🔥 outlet-aware fetch */
      const cart = await this.getActiveCart(
        {
          customerId: params.customerId,
          sessionId: params.sessionId,
          outletId: params.outletId,
        },
        client,
      );

      if (!cart) {
        throw new ValidationError('CART_NOT_FOUND', 'Cart not found');
      }

      if (!cart.canBeModified()) {
        throw new ValidationError('CART_LOCKED', 'Cart cannot be modified');
      }

      await this.cartRepo.clearItems(cart.id, client);

      return this.recalcTotals(cart.id, client);
    };

    return tx ? run(tx) : this.prisma.$transaction(run);
  }

  /* ================================================= */
  /* LOCK                                              */
  /* ================================================= */

  async lockCart(
    params: {
      customerId?: string;
      sessionId?: string;
      outletId: string;
    },
    tx?: PrismaTransaction,
  ): Promise<Cart> {
    const run = async (client: PrismaTransaction): Promise<Cart> => {
      const { cart, removedInactiveCount } = await this.syncActiveCart(
        {
          customerId: params.customerId,
          sessionId: params.sessionId,
          outletId: params.outletId,
        },
        client,
      );

      if (!cart) {
        throw new ValidationError('CART_NOT_FOUND', 'Cart not found');
      }

      if (removedInactiveCount > 0 && !cart.hasItems()) {
        throw new ValidationError(
          'CART_ITEMS_REMOVED',
          'One or more products were removed because they are no longer available.',
        );
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

const products = await client.product.findMany({
  where: {
    id: { in: cart.items.map(i => i.productId) },
  },
});

const productMap = new Map(products.map(p => [p.id, p]));

for (const item of cart.items) {
  const product = productMap.get(item.productId);

  if (!product || product.status !== 'ACTIVE' || !product.isAvailable) {
    throw new ValidationError(
      'PRODUCT_NOT_AVAILABLE',
      `${item.productName} is unavailable`,
    );
  }

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

      const locked = fresh.lock();

      return this.cartRepo.update(locked, client);
    };

    return tx ? run(tx) : this.prisma.$transaction(run);
  }

  async unlockCart(
    params: {
      customerId?: string;
      sessionId?: string;
      outletId: string; // 🔥 REQUIRED
    },
    tx?: PrismaTransaction,
  ): Promise<Cart | null> {
    const run = async (client: PrismaTransaction) => {
      /* 🔥 outlet-aware fetch */
      const cart = await this.getActiveCart(
        {
          customerId: params.customerId,
          sessionId: params.sessionId,
          outletId: params.outletId,
        },
        client,
      );

      if (!cart) return null;

      const unlocked = cart.unlock();

      return this.cartRepo.update(unlocked, client);
    };

    return tx ? run(tx) : this.prisma.$transaction(run);
  }

  /**
   * Clears the checkout cart after verified payment, including LOCKED carts.
   */
  async clearCartAfterPayment(
    params: {
      customerId: string;
      outletId: string;
    },
    tx?: PrismaTransaction,
  ): Promise<Cart | null> {
    const run = async (client: PrismaTransaction): Promise<Cart | null> => {
      const cart = await this.cartRepo.findOpenByCustomerAndOutlet(
        params.customerId,
        params.outletId,
        client,
      );

      if (!cart) {
        return null;
      }

      await this.cartRepo.clearItems(cart.id, client);

      const unlocked =
        cart.status === CartStatus.LOCKED ? cart.unlock() : cart;

      await this.cartRepo.update(unlocked, client);

      return this.recalcTotals(cart.id, client);
    };

    return tx ? run(tx) : this.prisma.$transaction(run);
  }
}
