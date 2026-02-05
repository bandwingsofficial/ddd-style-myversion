// src/modules/outlets/controllers/outlet-management.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Delete
} from '@nestjs/common';

import { OutletOrchestratorService } from '../services/outlet-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

/* DTOs */
import { CreateOutletDto } from '../dtos/create-outlet.dto';
import { UpdateOutletDetailsDto } from '../dtos/update-outlet-details.dto';
import { OutletCameraOnDto } from '../dtos/outlet-camera-on.dto';
import { OutletWorkingActionDto } from '../dtos/outlet-working-action.dto';

/* Domain */
import { Outlet } from '../domain/models/outlet.model';
import { GeoLocation } from '../domain/value-objects/geo-location.vo';
import { randomUUID } from 'crypto';

@Controller('outlets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OutletManagementController {
  constructor(
    private readonly orchestrator: OutletOrchestratorService,
  ) {}




  /* ================================================= */
/* OUTLET – LIST ALL (SUPER ADMIN ONLY)               */
/* ================================================= */

@Get()
@Roles(ActorType.SUPER_ADMIN)
async getAllOutlets() {
  const data = await this.orchestrator.getAllOutlets();

  return {
    success: true,
    code: 'OUTLETS_FETCHED',
    message: 'Outlets fetched successfully',
    data,
  };
}

  /* ================================================= */
  /* OUTLET – READS                                    */
  /* ================================================= */

  @Get(':outletId')
  async getOutletById(@Param('outletId') outletId: string) {
    const data = await this.orchestrator.getOutletById(outletId);

    return {
      success: true,
      code: 'OUTLET_FETCHED',
      message: 'Outlet fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* OUTLET – CREATE (SUPER ADMIN ONLY)                */
  /* ================================================= */

  @Post()
  @Roles(ActorType.SUPER_ADMIN)
  async createOutlet(
    @Body() dto: CreateOutletDto,
    @CurrentUser() user,
  ) {
    const location =
      dto.latitude !== undefined &&
      dto.longitude !== undefined
        ? GeoLocation.create(dto.latitude, dto.longitude)
        : undefined;

const outlet = Outlet.createNew({
  id: randomUUID(),
  name: dto.name,
  branch: dto.branch,
  address: dto.address,
  pincode: dto.pincode,
  location,
  deliveryRadiusKm: dto.deliveryRadiusKm,
  cameraEnabled: dto.cameraEnabled,
  isCentral: dto.isCentral,
  createdBy: user.actorId,
});

    const data = await this.orchestrator.createOutlet({
      outlet,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_CREATED',
      message: 'Outlet created successfully',
      data,
    };
  }

  /* ================================================= */
  /* OUTLET – UPDATE DETAILS (SUPER ADMIN ONLY)        */
  /* ================================================= */

  @Post(':outletId/update')
  @Roles(ActorType.SUPER_ADMIN)
  async updateOutletDetails(
    @Param('outletId') outletId: string,
    @Body() dto: UpdateOutletDetailsDto,
    @CurrentUser() user,
  ) {
    const data = await this.orchestrator.updateOutletDetails({
      outletId,
      updates: {
        name: dto.name,
        branch: dto.branch,
        address: dto.address,
        pincode: dto.pincode,
        latitude: dto.latitude,
        longitude: dto.longitude,
        deliveryRadiusKm: dto.deliveryRadiusKm,
      },
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_UPDATED',
      message: 'Outlet details updated successfully',
      data,
    };
  }

  /* ================================================= */
  /* OUTLET – ENABLE / DISABLE (SUPER ADMIN ONLY)      */
  /* ================================================= */

  @Post(':outletId/disable')
  @Roles(ActorType.SUPER_ADMIN)
  async disableOutlet(
    @Param('outletId') outletId: string,
    @CurrentUser() user,
  ) {
    const data = await this.orchestrator.disableOutlet({
      outletId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_DISABLED',
      message: 'Outlet disabled successfully',
      data,
    };
  }

  @Post(':outletId/enable')
  @Roles(ActorType.SUPER_ADMIN)
  async enableOutlet(
    @Param('outletId') outletId: string,
    @CurrentUser() user,
  ) {
    const data = await this.orchestrator.enableOutlet({
      outletId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_ENABLED',
      message: 'Outlet enabled successfully',
      data,
    };
  }

  /* ================================================= */
  /* OUTLET – WORKING STATUS (ADMIN + OUTLET USER)     */
  /* ================================================= */

  @Post(':outletId/working-status')
  @Roles(ActorType.SUPER_ADMIN, ActorType.OUTLET_USER)
  async changeWorkingStatus(
    @Param('outletId') outletId: string,
    @Body() dto: OutletWorkingActionDto,
    @CurrentUser() user,
  ) {
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
      code: 'OUTLET_WORKING_STATUS_UPDATED',
      message: 'Outlet working status updated',
      data: null,
    };
  }

  /* ================================================= */
  /* OUTLET – CAMERA (ADMIN + OUTLET USER)             */
  /* ================================================= */

  @Post(':outletId/camera/on')
  @Roles(ActorType.SUPER_ADMIN, ActorType.OUTLET_USER)
  async turnCameraOn(
    @Param('outletId') outletId: string,
    @Body() dto: OutletCameraOnDto,
    @CurrentUser() user,
  ) {
    await this.orchestrator.turnOutletCameraOn({
      outletId,
      streamUrl: dto.streamUrl,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_CAMERA_ON',
      message: 'Camera turned on successfully',
      data: null,
    };
  }

  @Post(':outletId/camera/off')
  @Roles(ActorType.SUPER_ADMIN, ActorType.OUTLET_USER)
  async turnCameraOff(
    @Param('outletId') outletId: string,
    @CurrentUser() user,
  ) {
    await this.orchestrator.turnOutletCameraOff({
      outletId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_CAMERA_OFF',
      message: 'Camera turned off successfully',
      data: null,
    };
  }

  /* ================================================= */
  /* OUTLET PRODUCTS – READ                            */
  /* ================================================= */

  @Get(':outletId/products')
  @Roles(ActorType.SUPER_ADMIN, ActorType.OUTLET_USER)
  async getOutletProducts(
    @Param('outletId') outletId: string,
  ) {
    const data = await this.orchestrator.getOutletProducts(outletId);

    return {
      success: true,
      code: 'OUTLET_PRODUCTS_FETCHED',
      message: 'Outlet products fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* OUTLET PRODUCTS – ASSIGN (SUPER ADMIN ONLY)       */
  /* ================================================= */

  @Post(':outletId/products')
  @Roles(ActorType.SUPER_ADMIN)
  async assignProduct(
    @Param('outletId') outletId: string,
    @Body() body: { productId: string },
    @CurrentUser() user,
  ) {
    const data = await this.orchestrator.assignProductToOutlet({
      outletId,
      productId: body.productId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_PRODUCT_ASSIGNED',
      message: 'Product assigned to outlet successfully',
      data,
    };
  }

  /* ================================================= */
  /* OUTLET PRODUCTS – ENABLE                          */
  /* ================================================= */

  @Post(':outletId/products/:productId/enable')
  @Roles(ActorType.SUPER_ADMIN, ActorType.OUTLET_USER)
  async enableProduct(
    @Param('outletId') outletId: string,
    @Param('productId') productId: string,
    @CurrentUser() user,
  ) {
    await this.orchestrator.enableOutletProduct({
      outletId,
      productId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_PRODUCT_ENABLED',
      message: 'Product enabled successfully',
      data: null,
    };
  }

  /* ================================================= */
  /* OUTLET PRODUCTS – DISABLE                         */
  /* ================================================= */

  @Post(':outletId/products/:productId/disable')
  @Roles(ActorType.SUPER_ADMIN, ActorType.OUTLET_USER)
  async disableProduct(
    @Param('outletId') outletId: string,
    @Param('productId') productId: string,
    @CurrentUser() user,
  ) {
    await this.orchestrator.disableOutletProduct({
      outletId,
      productId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_PRODUCT_DISABLED',
      message: 'Product disabled successfully',
      data: null,
    };
  }

  /* ================================================= */
  /* OUTLET PRODUCTS – PRICING UPDATE                  */
  /* ================================================= */

  @Post(':outletId/products/:productId/pricing')
  @Roles(ActorType.SUPER_ADMIN)
  async updatePricing(
    @Param('outletId') outletId: string,
    @Param('productId') productId: string,
    @Body() body: { priceOverride?: number; discountOverride?: number },
    @CurrentUser() user,
  ) {
    await this.orchestrator.updateOutletProductPricing({
      outletId,
      productId,
      priceOverride: body.priceOverride ?? null,
      discountOverride: body.discountOverride ?? null,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_PRODUCT_PRICING_UPDATED',
      message: 'Product pricing updated successfully',
      data: null,
    };
  }

  /* ================================================= */
  /* OUTLET PRODUCTS – DELETE (REMOVE ASSIGNMENT)      */
  /* ================================================= */

  @Delete(':outletId/products/:productId')
  @Roles(ActorType.SUPER_ADMIN)
  async deleteProduct(
    @Param('outletId') outletId: string,
    @Param('productId') productId: string,
    @CurrentUser() user,
  ) {
    await this.orchestrator.removeProductFromOutlet({
      outletId,
      productId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_PRODUCT_REMOVED',
      message: 'Product removed from outlet successfully',
      data: null,
    };
  }
}
