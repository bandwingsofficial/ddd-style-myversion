// src/modules/cart/services/cart.service.ts

import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { Cart } from '../domain/models/cart.model';
import { CartItem } from '../domain/models/cart-item.model';
import { CartStatus } from '../domain/enums/cart-status.enum';

import { CartRepository } from '../repositories/cart.repository';

import { ValidationError } from '../../../common/errors';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartRepo: CartRepository,
  ) {}

  /* ================================================= */
  /* READS                                            */
  /* ================================================= */

  async getActiveCart(customerId: string): Promise<Cart | null> {
    return this.cartRepo.findActiveByCustomerId(customerId);
  }

  /* ================================================= */
  /* CREATE / GET ACTIVE CART                          */
  /* ================================================= */

  private async getOrCreateActiveCart(params: {
    customerId: string;
    outletId: string;
  }): Promise<Cart> {
    let cart =
      await this.cartRepo.findActiveByCustomerId(params.customerId);

    if (cart) {
      if (cart.outletId !== params.outletId) {
        throw new ValidationError(
          'CART_OUTLET_MISMATCH',
          'Cannot use multiple outlets in the same cart',
        );
      }
      return cart;
    }

    const newCart = Cart.createNew({
      id: uuid(),
      customerId: params.customerId,
      outletId: params.outletId,
    });

    return this.cartRepo.create(newCart);
  }

  /* ================================================= */
  /* ADD ITEM                                         */
  /* ================================================= */

  async addItem(params: {
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
    if (params.quantity <= 0) {
      throw new ValidationError(
        'CART_INVALID_QUANTITY',
        'Quantity must be greater than zero',
      );
    }

    const cart = await this.getOrCreateActiveCart({
      customerId: params.customerId,
      outletId: params.outletId,
    });

    const existingItem = cart.items.find(
      (i) => i.productId === params.product.id,
    );

    if (existingItem) {
      const updatedItem = existingItem.increaseQuantity(
        params.quantity,
      );

      await this.cartRepo.updateItem(updatedItem);
    } else {
      const item = CartItem.createNew({
        id: uuid(),
        cartId: cart.id,
        productId: params.product.id,
        quantity: params.quantity,
        unitPrice: params.product.unitPrice,
        discountPrice: params.product.discountPrice,
        productName: params.product.name,
        productImage: params.product.image,
      });

      await this.cartRepo.addItem(item);
    }

    return this.cartRepo.findById(cart.id) as Promise<Cart>;
  }

  /* ================================================= */
  /* UPDATE ITEM QUANTITY                             */
  /* ================================================= */

  async updateItemQuantity(params: {
    customerId: string;
    productId: string;
    quantity: number;
  }): Promise<Cart> {
    const cart =
      await this.cartRepo.findActiveByCustomerId(params.customerId);

    if (!cart) {
      throw new ValidationError(
        'CART_NOT_FOUND',
        'Active cart not found',
      );
    }

    const item = cart.items.find(
      (i) => i.productId === params.productId,
    );

    if (!item) {
      throw new ValidationError(
        'CART_ITEM_NOT_FOUND',
        'Cart item not found',
      );
    }

    if (params.quantity <= 0) {
      await this.cartRepo.removeItem(cart.id, params.productId);
      return this.cartRepo.findById(cart.id) as Promise<Cart>;
    }

    const updatedItem = item.updateQuantity(params.quantity);

    await this.cartRepo.updateItem(updatedItem);

    return this.cartRepo.findById(cart.id) as Promise<Cart>;
  }

  /* ================================================= */
  /* REMOVE ITEM                                      */
  /* ================================================= */

  async removeItem(params: {
    customerId: string;
    productId: string;
  }): Promise<Cart> {
    const cart =
      await this.cartRepo.findActiveByCustomerId(params.customerId);

    if (!cart) {
      throw new ValidationError(
        'CART_NOT_FOUND',
        'Active cart not found',
      );
    }

    await this.cartRepo.removeItem(cart.id, params.productId);

    return this.cartRepo.findById(cart.id) as Promise<Cart>;
  }

  /* ================================================= */
  /* CLEAR CART                                       */
  /* ================================================= */

  async clearCart(customerId: string): Promise<void> {
    const cart =
      await this.cartRepo.findActiveByCustomerId(customerId);

    if (!cart) return;

    await this.cartRepo.clearItems(cart.id);
  }

  /* ================================================= */
  /* LOCK CART (CHECKOUT)                             */
  /* ================================================= */

  async lockCart(customerId: string): Promise<Cart> {
    const cart =
      await this.cartRepo.findActiveByCustomerId(customerId);

    if (!cart) {
      throw new ValidationError(
        'CART_NOT_FOUND',
        'Active cart not found',
      );
    }

    if (cart.status !== CartStatus.ACTIVE) {
      return cart;
    }

    const locked = cart.lock();

    return this.cartRepo.update(locked);
  }
}
