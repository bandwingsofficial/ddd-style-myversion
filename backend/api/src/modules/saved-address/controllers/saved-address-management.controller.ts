import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { SavedAddressOrchestratorService } from '../services/saved-address-orchestrator.service';
import { OutletOrchestratorService } from '../../outlets/services/outlet-orchestrator.service'; // ⭐ NEW

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

/* DTOs */
import { CreateSavedAddressDto } from '../dtos/create-saved-address.dto';
import { UpdateSavedAddressDto } from '../dtos/update-saved-address.dto';

/* Domain */
import { SavedAddress } from '../domain/models/saved-address.model';
import { randomUUID } from 'crypto';

@Controller('saved-addresses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.CUSTOMER)
export class SavedAddressManagementController {
  constructor(
    private readonly orchestrator: SavedAddressOrchestratorService,
    private readonly outletOrchestrator: OutletOrchestratorService, // ⭐ NEW
  ) {}

  /* ================= READ ================= */

  @Get()
  async getAllSavedAddresses(@CurrentUser() user) {
    const data =
      await this.orchestrator.getAllSavedAddresses({
        customerId: user.actorId,
      });

    return {
      success: true,
      code: 'SAVED_ADDRESSES_FETCHED',
      message: 'Saved addresses fetched successfully',
      data,
    };
  }

  @Get(':savedAddressId')
  async getSavedAddressById(
    @Param('savedAddressId') savedAddressId: string,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.getSavedAddressById({
        customerId: user.actorId,
        savedAddressId,
      });

    return {
      success: true,
      code: 'SAVED_ADDRESS_FETCHED',
      message: 'Saved address fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* ⭐ NEW – GET OUTLETS BY SAVED ADDRESS (GEO)       */
  /* ================================================= */

  @Get(':savedAddressId/outlets')
  async getOutletsBySavedAddress(
    @Param('savedAddressId') savedAddressId: string,
    @CurrentUser() user,
  ) {
    const address =
      await this.orchestrator.getSavedAddressById({
        customerId: user.actorId,
        savedAddressId,
      });

    if (!address.latitude || !address.longitude) {
      return {
        success: true,
        code: 'NO_LOCATION_FOR_ADDRESS',
        message: 'Address has no coordinates',
        data: [],
      };
    }

    const outlets =
      await this.outletOrchestrator.getNearbyOutlets(
        address.latitude,
        address.longitude,
      );

    return {
      success: true,
      code: 'OUTLETS_BY_ADDRESS_FETCHED',
      message: 'Nearby outlets fetched successfully',
      data: outlets,
    };
  }

  /* ================= CREATE ================= */

  @Post()
  async createSavedAddress(
    @Body() dto: CreateSavedAddressDto,
    @CurrentUser() user,
  ) {
    const address = SavedAddress.createNew({
      id: randomUUID(),
      customerId: user.actorId,
      type: dto.type,
      label: dto.label,
      addressText: dto.addressText,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    const data =
      await this.orchestrator.createSavedAddress({ address });

    return {
      success: true,
      code: 'SAVED_ADDRESS_CREATED',
      message: 'Saved address created successfully',
      data,
    };
  }

  /* ================= UPDATE ================= */

  @Post(':savedAddressId/update')
  async updateSavedAddress(
    @Param('savedAddressId') savedAddressId: string,
    @Body() dto: UpdateSavedAddressDto,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.updateSavedAddress({
        customerId: user.actorId,
        savedAddressId,
        label: dto.label,
        addressText: dto.addressText,
        latitude: dto.latitude,
        longitude: dto.longitude,
      });

    return {
      success: true,
      code: 'SAVED_ADDRESS_UPDATED',
      message: 'Saved address updated successfully',
      data,
    };
  }

  /* ================= DELETE ================= */

  @Post(':savedAddressId/delete')
  async deleteSavedAddress(
    @Param('savedAddressId') savedAddressId: string,
    @CurrentUser() user,
  ) {
    const data =
      await this.orchestrator.deleteSavedAddress({
        customerId: user.actorId,
        savedAddressId,
      });

    return {
      success: true,
      code: 'SAVED_ADDRESS_DELETED',
      message: 'Saved address deleted successfully',
      data,
    };
  }
}
 