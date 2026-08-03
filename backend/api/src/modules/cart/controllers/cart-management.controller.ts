import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ValidationError } from '../../../common/errors';
import { CartOrchestratorService } from '../services/cart-orchestrator.service';
import { CartResponseMapper } from '../mappers/cart-response.mapper';

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
  constructor(
    private readonly orchestrator: CartOrchestratorService,
    private readonly cartResponseMapper: CartResponseMapper,
  ) {}

  private async mapCart(
    cart: Awaited<ReturnType<CartOrchestratorService['getActiveCart']>>['cart'],
  ) {
    return this.cartResponseMapper.toResponse(cart);
  }

  /* ================================================= */
  /* GET ACTIVE CART                                   */
  /* ================================================= */

  @Get()
  async getActiveCart(
    @CurrentUser() user: { actorId: string },
    @Query('outletId') outletId: string,
  ) {
    if (!outletId) {
      throw new ValidationError('OUTLET_ID_REQUIRED', 'Outlet id is required');
    }

    const { cart, removedInactiveCount } =
      await this.orchestrator.getActiveCart({
        customerId: user.actorId,
        outletId,
      });

    return {
      success: true,
      code: removedInactiveCount > 0 ? 'CART_ITEMS_REMOVED' : 'CART_FETCHED',
      message:
        removedInactiveCount > 0
          ? 'One or more products were removed because they are no longer available.'
          : 'Cart fetched successfully',
      data: await this.mapCart(cart),
      meta: { removedInactiveCount },
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
      ...dto, // 🔥 pass forceReplace automatically
      product: { id: dto.productId },
    });

    return {
      success: true,
      code: 'CART_ITEM_ADDED',
      message: 'Item added to cart',
      data: await this.cartResponseMapper.toResponse(data),
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
    @Query('outletId') outletId: string,
  ) {
    if (!outletId) {
      throw new ValidationError('OUTLET_ID_REQUIRED', 'Outlet id is required');
    }

    const data = await this.orchestrator.updateCartItemQuantity({
      customerId: user.actorId,
      outletId,
      productId,
      quantity: dto.quantity,
    });

    return {
      success: true,
      code: 'CART_ITEM_UPDATED',
      message: 'Cart item updated',
      data: await this.cartResponseMapper.toResponse(data),
    };
  }

  /* ================================================= */
  /* REMOVE ITEM                                       */
  /* ================================================= */

  @Delete('items/:productId')
  async removeItem(
    @CurrentUser() user: { actorId: string },
    @Param('productId') productId: string,
    @Query('outletId') outletId: string,
  ) {
    if (!outletId) {
      throw new ValidationError('OUTLET_ID_REQUIRED', 'Outlet id is required');
    }

    const data = await this.orchestrator.removeCartItem({
      customerId: user.actorId,
      outletId,
      productId,
    });

    return {
      success: true,
      code: 'CART_ITEM_REMOVED',
      message: 'Cart item removed',
      data: await this.cartResponseMapper.toResponse(data),
    };
  }

  /* ================================================= */
  /* CLEAR CART                                        */
  /* ================================================= */

  @Delete()
  async clearCart(
    @CurrentUser() user: { actorId: string },
    @Query('outletId') outletId: string,
  ) {
    if (!outletId) {
      throw new ValidationError('OUTLET_ID_REQUIRED', 'Outlet id is required');
    }

    const data = await this.orchestrator.clearCart({
      customerId: user.actorId,
      outletId,
    });

    return {
      success: true,
      code: 'CART_CLEARED',
      message: 'Cart cleared successfully',
      data: await this.cartResponseMapper.toResponse(data),
    };
  }

  /* ================================================= */
  /* CHECKOUT (LOCK CART)                              */
  /* ================================================= */

  @Post('checkout')
  async checkout(
    @CurrentUser() user: { actorId: string },
    @Query('outletId') outletId: string,
  ) {
    if (!outletId) {
      throw new ValidationError('OUTLET_ID_REQUIRED', 'Outlet id is required');
    }

    const data = await this.orchestrator.lockCartForCheckout({
      customerId: user.actorId,
      outletId,
    });

    return {
      success: true,
      code: 'CART_LOCKED',
      message: 'Cart locked for checkout',
      data: await this.cartResponseMapper.toResponse(data),
    };
  }
}
