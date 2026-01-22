// src/modules/cart/services/cart-orchestrator.service.ts

import { Injectable } from '@nestjs/common';

import { CartService } from './cart.service';
import { Cart } from '../domain/models/cart.model';

@Injectable()
export class CartOrchestratorService {
  constructor(
    private readonly cartService: CartService,
  ) {}

  /* ================================================= */
  /* CART – READS                                     */
  /* ================================================= */

  async getActiveCart(
    customerId: string,
  ): Promise<Cart | null> {
    return this.cartService.getActiveCart(customerId);
  }

  /* ================================================= */
  /* CART – ADD ITEM                                  */
  /* ================================================= */

  async addItemToCart(params: {
    customerId: string;
    outletId: string;
    product: {
      id: string;
      name: string;
      image: string;
      unitPrice: number;
      discountPrice?: number;
    };
    quantity: number;
  }): Promise<Cart> {
    return this.cartService.addItem(params);
  }

  /* ================================================= */
  /* CART – UPDATE ITEM                               */
  /* ================================================= */

  async updateCartItemQuantity(params: {
    customerId: string;
    productId: string;
    quantity: number;
  }): Promise<Cart> {
    return this.cartService.updateItemQuantity(params);
  }

  /* ================================================= */
  /* CART – REMOVE ITEM                               */
  /* ================================================= */

  async removeCartItem(params: {
    customerId: string;
    productId: string;
  }): Promise<Cart> {
    return this.cartService.removeItem(params);
  }

  /* ================================================= */
  /* CART – CLEAR                                    */
  /* ================================================= */

  async clearCart(
    customerId: string,
  ): Promise<void> {
    return this.cartService.clearCart(customerId);
  }

  /* ================================================= */
  /* CART – CHECKOUT (LOCK)                           */
  /* ================================================= */

  async lockCartForCheckout(
    customerId: string,
  ): Promise<Cart> {
    return this.cartService.lockCart(customerId);
  }
}
