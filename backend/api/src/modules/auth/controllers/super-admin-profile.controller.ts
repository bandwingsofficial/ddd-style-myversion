import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../domain/enums/actor-type.enum';

import { AuthOrchestratorService } from '../services/auth-orchestrator.service';

import { CreateSuperAdminProfileDto } from '../dto/create-super-admin-profile.dto';
import { UpdateSuperAdminProfileDto } from '../dto/update-super-admin-profile.dto';

/* ================================================= */
/* CONTROLLER                                        */
/* ================================================= */

@Controller('me/super-admin/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.SUPER_ADMIN)
export class SuperAdminProfileController {
  constructor(
    private readonly orchestrator: AuthOrchestratorService,
  ) {}

  /* ================================================= */
  /* GET PROFILE                                       */
  /* ================================================= */

  @Get()
  async getProfile(@CurrentUser() user) {
    const data = await this.orchestrator.getSuperAdminProfile(
      user.actorId,
    );

    return {
      success: true,
      code: 'SUPER_ADMIN_PROFILE_FETCHED',
      message: 'Profile fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* CREATE PROFILE                                    */
  /* ================================================= */

  @Post()
  async createProfile(
    @CurrentUser() user,
    @Body() dto: CreateSuperAdminProfileDto,
  ) {
    const data = await this.orchestrator.createSuperAdminProfile({
      superAdminId: user.actorId,
      ...dto,
    });

    return {
      success: true,
      code: 'SUPER_ADMIN_PROFILE_CREATED',
      message: 'Profile created successfully',
      data,
    };
  }

  /* ================================================= */
  /* UPDATE PROFILE                                    */
  /* ================================================= */

  @Patch()
  async updateProfile(
    @CurrentUser() user,
    @Body() dto: UpdateSuperAdminProfileDto,
  ) {
    const data = await this.orchestrator.updateSuperAdminProfile({
      superAdminId: user.actorId,
      updates: dto,
    });

    return {
      success: true,
      code: 'SUPER_ADMIN_PROFILE_UPDATED',
      message: 'Profile updated successfully',
      data,
    };
  }

  /* ================================================= */
  /* UPSERT PROFILE (very useful)                      */
  /* ================================================= */

  @Post('upsert')
  async upsertProfile(
    @CurrentUser() user,
    @Body() dto: UpdateSuperAdminProfileDto,
  ) {
    const data = await this.orchestrator.upsertSuperAdminProfile({
      superAdminId: user.actorId,
      ...dto,
    });

    return {
      success: true,
      code: 'SUPER_ADMIN_PROFILE_SAVED',
      message: 'Profile saved successfully',
      data,
    };
  }

  /* ================================================= */
  /* DELETE PROFILE                                    */
  /* ================================================= */

  @Delete()
  async deleteProfile(@CurrentUser() user) {
    await this.orchestrator.deleteSuperAdminProfile(
      user.actorId,
    );

    return {
      success: true,
      code: 'SUPER_ADMIN_PROFILE_DELETED',
      message: 'Profile deleted successfully',
      data: null,
    };
  }
}
