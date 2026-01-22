// src/modules/cart/controllers/cart-management.controller.ts

import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';

import { CartOrchestratorService } from '../services/cart-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.CUSTOMER)
export class CartManagementController {
  constructor(
    private readonly orchestrator: CartOrchestratorService,
  ) {}

  /* ================================================= */
  /* CART – GET ACTIVE                                 */
  /* ================================================= */

  @Get()
  async getActiveCart(
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.getActiveCart(user.actorId);

    return {
      success: true,
      code: 'CART_FETCHED',
      message: 'Cart fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* CART – ADD ITEM                                   */
  /* ================================================= */

  @Post('items')
  async addItem(
    @CurrentUser() user,
    @Body()
    body: {
      outletId: string;
      productId: string;
      productName: string;
      productImage: string;
      unitPrice: number;
      discountPrice?: number;
      quantity: number;
    },
  ) {
    const data =
      await this.orchestrator.addItemToCart({
        customerId: user.actorId,
        outletId: body.outletId,
        product: {
          id: body.productId,
          name: body.productName,
          image: body.productImage,
          unitPrice: body.unitPrice,
          discountPrice: body.discountPrice,
        },
        quantity: body.quantity,
      });

    return {
      success: true,
      code: 'CART_ITEM_ADDED',
      message: 'Item added to cart',
      data,
    };
  }

  /* ================================================= */
  /* CART – UPDATE ITEM                                */
  /* ================================================= */

  @Post('items/:productId')
  async updateItem(
    @CurrentUser() user,
    @Param('productId') productId: string,
    @Body() body: { quantity: number },
  ) {
    const data =
      await this.orchestrator.updateCartItemQuantity({
        customerId: user.actorId,
        productId,
        quantity: body.quantity,
      });

    return {
      success: true,
      code: 'CART_ITEM_UPDATED',
      message: 'Cart item updated',
      data,
    };
  }

  /* ================================================= */
  /* CART – REMOVE ITEM                                */
  /* ================================================= */

  @Post('items/:productId/remove')
  async removeItem(
    @CurrentUser() user,
    @Param('productId') productId: string,
  ) {
    const data =
      await this.orchestrator.removeCartItem({
        customerId: user.actorId,
        productId,
      });

    return {
      success: true,
      code: 'CART_ITEM_REMOVED',
      message: 'Cart item removed',
      data,
    };
  }

  /* ================================================= */
  /* CART – CLEAR                                     */
  /* ================================================= */

  @Post('clear')
  async clearCart(
    @CurrentUser() user,
  ) {
    await this.orchestrator.clearCart(user.actorId);

    return {
      success: true,
      code: 'CART_CLEARED',
      message: 'Cart cleared successfully',
      data: null,
    };
  }

  /* ================================================= */
  /* CART – CHECKOUT (LOCK)                            */
  /* ================================================= */

  @Post('checkout')
  async checkout(
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.lockCartForCheckout(
        user.actorId,
      );

    return {
      success: true,
      code: 'CART_LOCKED',
      message: 'Cart locked for checkout',
      data,
    };
  }
}
