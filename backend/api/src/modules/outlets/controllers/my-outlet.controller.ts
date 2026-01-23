import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';

import { OutletOrchestratorService } from '../services/outlet-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

import { OutletWorkingActionDto } from '../dtos/outlet-working-action.dto';
import { OutletCameraOnDto } from '../dtos/outlet-camera-on.dto';

@Controller('my-outlet')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.OUTLET_USER) // 🔥 only outlet users
export class MyOutletController {
  constructor(
    private readonly orchestrator: OutletOrchestratorService,
  ) {}

  /* ================================================= */
  /* HELPER – resolve outletId from current user        */
  /* ================================================= */

  private async getMyOutletId(user): Promise<string> {
    const outletUser =
      await this.orchestrator.getOutletUserById(user.actorId);

    return outletUser.outletId;
  }

  /* ================================================= */
  /* PRODUCTS – LIST                                   */
  /* ================================================= */

  @Get('products')
  async getMyProducts(@CurrentUser() user) {
    const outletId = await this.getMyOutletId(user);

    const data = await this.orchestrator.getOutletProducts(outletId);

    return {
      success: true,
      code: 'MY_OUTLET_PRODUCTS_FETCHED',
      message: 'Products fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* PRODUCTS – ENABLE                                 */
  /* ================================================= */

  @Post('products/:productId/enable')
  async enableProduct(
    @Param('productId') productId: string,
    @CurrentUser() user,
  ) {
    const outletId = await this.getMyOutletId(user);

    await this.orchestrator.enableOutletProduct({
      outletId,
      productId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'PRODUCT_ENABLED',
      message: 'Product enabled successfully',
      data: null,
    };
  }

  /* ================================================= */
  /* PRODUCTS – DISABLE                                */
  /* ================================================= */

  @Post('products/:productId/disable')
  async disableProduct(
    @Param('productId') productId: string,
    @CurrentUser() user,
  ) {
    const outletId = await this.getMyOutletId(user);

    await this.orchestrator.disableOutletProduct({
      outletId,
      productId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'PRODUCT_DISABLED',
      message: 'Product disabled successfully',
      data: null,
    };
  }

  /* ================================================= */
  /* MY OUTLET – DETAILS                               */
  /* ================================================= */

  @Get()
  async getMyOutletDetails(@CurrentUser() user) {
    const outletId = await this.getMyOutletId(user);

    const outlet = await this.orchestrator.getOutletById(outletId);

    return {
      success: true,
      code: 'MY_OUTLET_FETCHED',
      message: 'Outlet details fetched successfully',
      data: outlet,
    };
  }

  /* ================================================= */
  /* WORKING STATUS – OPEN / CLOSE / TEMP CLOSE         */
  /* ================================================= */

  @Post('working-status')
  async changeWorkingStatus(
    @Body() dto: OutletWorkingActionDto,
    @CurrentUser() user,
  ) {
    const outletId = await this.getMyOutletId(user);

    switch (dto.status) {
      case 'OPEN':
        await this.orchestrator.openOutlet({
          outletId,
          adminId: user.actorId,
        });
        break;

      case 'CLOSED':
        await this.orchestrator.closeOutlet({
          outletId,
          adminId: user.actorId,
        });
        break;

      case 'TEMPORARILY_CLOSED':
        await this.orchestrator.temporarilyCloseOutlet({
          outletId,
          adminId: user.actorId,
        });
        break;
    }

    return {
      success: true,
      code: 'WORKING_STATUS_UPDATED',
      message: 'Working status updated successfully',
      data: null,
    };
  }

  /* ================================================= */
  /* CAMERA – ON                                       */
  /* ================================================= */

  @Post('camera/on')
  async turnCameraOn(
    @Body() dto: OutletCameraOnDto,
    @CurrentUser() user,
  ) {
    const outletId = await this.getMyOutletId(user);

    await this.orchestrator.turnOutletCameraOn({
      outletId,
      streamUrl: dto.streamUrl,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'CAMERA_ON',
      message: 'Camera turned on successfully',
      data: null,
    };
  }

  /* ================================================= */
  /* CAMERA – OFF                                      */
  /* ================================================= */

  @Post('camera/off')
  async turnCameraOff(@CurrentUser() user) {
    const outletId = await this.getMyOutletId(user);

    await this.orchestrator.turnOutletCameraOff({
      outletId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'CAMERA_OFF',
      message: 'Camera turned off successfully',
      data: null,
    };
  }
}
