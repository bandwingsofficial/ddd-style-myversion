import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';

import { CartOrchestratorService } from '../services/cart-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

import { AddCartItemDto } from '../dtos/add-cart-item.dto';
import { UpdateCartItemDto } from '../dtos/update-cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.CUSTOMER)
export class CartManagementController {
  constructor(private readonly orchestrator: CartOrchestratorService) {}

  /* ================================================= */
  /* GET ACTIVE CART                                   */
  /* ================================================= */

  @Get()
  async getActiveCart(@CurrentUser() user: { actorId: string }) {
    const data = await this.orchestrator.getActiveCart({
      customerId: user.actorId,
    });

    return {
      success: true,
      code: 'CART_FETCHED',
      message: 'Cart fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* ADD ITEM                                          */
  /* ================================================= */

  @Post('items')
  async addItem(
    @CurrentUser() user: { actorId: string },
    @Body() dto: AddCartItemDto,
  ) {
    const data = await this.orchestrator.addItemToCart({
      customerId: user.actorId,
      outletId: dto.outletId,
      product: { id: dto.productId },
      quantity: dto.quantity,
    });

    return {
      success: true,
      code: 'CART_ITEM_ADDED',
      message: 'Item added to cart',
      data,
    };
  }

  /* ================================================= */
  /* UPDATE ITEM QTY                                   */
  /* ================================================= */

  @Patch('items/:productId')
  async updateItem(
    @CurrentUser() user: { actorId: string },
    @Param('productId') productId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const data = await this.orchestrator.updateCartItemQuantity({
      customerId: user.actorId,
      productId,
      quantity: dto.quantity,
    });

    return {
      success: true,
      code: 'CART_ITEM_UPDATED',
      message: 'Cart item updated',
      data,
    };
  }

  /* ================================================= */
  /* REMOVE ITEM                                       */
  /* ================================================= */

  @Delete('items/:productId')
  async removeItem(
    @CurrentUser() user: { actorId: string },
    @Param('productId') productId: string,
  ) {
    const data = await this.orchestrator.removeCartItem({
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
  /* CLEAR CART                                        */
  /* ================================================= */

  @Delete()
  async clearCart(@CurrentUser() user: { actorId: string }) {
    const data = await this.orchestrator.clearCart({
      customerId: user.actorId,
    });

    return {
      success: true,
      code: 'CART_CLEARED',
      message: 'Cart cleared successfully',
      data,
    };
  }

  /* ================================================= */
  /* CHECKOUT (LOCK CART)                              */
  /* ================================================= */

  @Post('checkout')
  async checkout(@CurrentUser() user: { actorId: string }) {
    const data = await this.orchestrator.lockCartForCheckout({
      customerId: user.actorId,
    });

    return {
      success: true,
      code: 'CART_LOCKED',
      message: 'Cart locked for checkout',
      data,
    };
  }
}
