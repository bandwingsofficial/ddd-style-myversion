import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { CartService } from './cart.service';
import { Cart } from '../domain/models/cart.model';

@Injectable()
export class CartOrchestratorService {
  constructor(
    private readonly cartService: CartService,
    private readonly prisma: PrismaService,
  ) {}

  /* ================================================= */
  /* CART – READS                                     */
  /* ================================================= */

  async getActiveCart(
    params: { customerId?: string; sessionId?: string },
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
      const guestCart = await this.cartService.getActiveCart(
        { sessionId },
        tx,
      );

      const customerCart = await this.cartService.getActiveCart(
        { customerId },
        tx,
      );

      /* ------------------------------ */
      /* nothing to merge               */
      /* ------------------------------ */
      if (!guestCart) return customerCart;

      /* ------------------------------ */
      /* only guest exists → transfer   */
      /* ------------------------------ */
      if (!customerCart) {
        await tx.cart.update({
          where: { id: guestCart.id },
          data: {
            customerId,
            sessionId: null,
          },
        });

        return this.cartService.getActiveCart({ customerId }, tx);
      }

      /* ------------------------------ */
      /* both exist → merge items       */
      /* ------------------------------ */
      for (const item of guestCart.items) {
        await this.cartService.addItem(
          {
            customerId,
            outletId: guestCart.outletId,
            product: { id: item.productId },
            quantity: item.quantity,
          },
          tx, // 🔥 reuse SAME transaction
        );
      }

      /* delete guest cart */
      await this.cartService.clearCart({ sessionId }, tx);

      return this.cartService.getActiveCart({ customerId }, tx);
    });
  }

  /* ================================================= */
  /* CART WRAPPERS                                    */
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

  async clearCart(params: any, tx?: PrismaTransaction): Promise<Cart | null> {
    return this.cartService.clearCart(params, tx);
  }

  async lockCartForCheckout(params: any, tx?: PrismaTransaction): Promise<Cart> {
    return this.cartService.lockCart(params, tx);
  }
  async unlockCart(params: any, tx?: PrismaTransaction): Promise<Cart> {
    return this.cartService.unlockCart(params, tx);
  }
}
