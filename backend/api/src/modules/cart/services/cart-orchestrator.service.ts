import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { CartService } from './cart.service';
import { CartRepository } from '../repositories/cart.repository';
import { Cart } from '../domain/models/cart.model';

@Injectable()
export class CartOrchestratorService {
  constructor(
    private readonly cartService: CartService,
    private readonly cartRepo: CartRepository, // ✅ use repo (clean architecture)
    private readonly prisma: PrismaService,
  ) {}

  /* ================================================= */
  /* CART – READS                                      */
  /* ================================================= */

  async getActiveCart(
    params: {
      customerId?: string;
      sessionId?: string;
      outletId: string; // 🔥 REQUIRED
    },
    tx?: PrismaTransaction,
  ): Promise<Cart | null> {
    return this.cartService.getActiveCart(params, tx);
  }

  /* ================================================= */
  /* 🔥 AUTO MERGE (AFTER LOGIN)                        */
  /* ================================================= */

  async mergeGuestCartIntoCustomerCart(
    sessionId: string,
    customerId: string,
  ): Promise<Cart | null> {
    return this.prisma.$transaction(async (tx) => {

      /* ===================================== */
      /* 🔥 Step 1 — get guest cart            */
      /* ===================================== */

      const guestRow = await tx.cart.findFirst({
        where: {
          sessionId,
          status: 'ACTIVE',
        },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });

      if (!guestRow) return null;

      const guestCart = this.cartRepo.mapToDomain(guestRow);
      const outletId = guestCart.outletId;

      /* ===================================== */
      /* 🔥 Step 2 — get customer cart (same outlet) */
      /* ===================================== */

      const customerCart = await this.cartService.getActiveCart(
        { customerId, outletId },
        tx,
      );

      /* ===================================== */
      /* 🔥 Step 3 — only guest exists → transfer */
      /* ===================================== */

      if (!customerCart) {
        await tx.cart.update({
          where: { id: guestCart.id },
          data: {
            customerId,
            sessionId: null,
          },
        });

        return this.cartService.getActiveCart(
          { customerId, outletId },
          tx,
        );
      }

      /* ===================================== */
      /* 🔥 Step 4 — merge items (FAST)         */
      /* ===================================== */

      await Promise.all(
        guestCart.items.map((item) =>
          this.cartService.addItem(
            {
              customerId,
              outletId,
              product: { id: item.productId },
              quantity: item.quantity,
              forceReplace: false,
            },
            tx,
          ),
        ),
      );

      /* ===================================== */
      /* 🔥 Step 5 — clear guest cart           */
      /* ===================================== */

      await this.cartService.clearCart(
        { sessionId, outletId },
        tx,
      );

      return this.cartService.getActiveCart(
        { customerId, outletId },
        tx,
      );
    });
  }

  /* ================================================= */
  /* CART WRAPPERS (thin pass-throughs)                */
  /* ================================================= */

  async addItemToCart(params: any, tx?: PrismaTransaction): Promise<Cart> {
    return this.cartService.addItem(params, tx);
  }

  async updateCartItemQuantity(params: any, tx?: PrismaTransaction): Promise<Cart> {
    return this.cartService.updateItemQuantity(params, tx);
  }

  async removeCartItem(params: any, tx?: PrismaTransaction): Promise<Cart> {
    return this.cartService.removeItem(params, tx);
  }

  async clearCart(params: any, tx?: PrismaTransaction): Promise<Cart> {
    return this.cartService.clearCart(params, tx);
  }

  async lockCartForCheckout(params: any, tx?: PrismaTransaction): Promise<Cart> {
    return this.cartService.lockCart(params, tx);
  }

  async unlockCart(params: any, tx?: PrismaTransaction): Promise<Cart | null> {
    return this.cartService.unlockCart(params, tx);
  }
}
