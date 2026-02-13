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

import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { superAdminProfileImageUploadOptions } from '../../../common/upload/superadminprofile-image-upload.options';


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
  /* CREATE PROFILE (🔥 with avatar upload)           */
  /* ================================================= */

  @Post()
  @UseInterceptors(
    FileInterceptor(
      'avatar',
      superAdminProfileImageUploadOptions,
    ),
  )
  async createProfile(
    @CurrentUser() user,
    @Body() dto: CreateSuperAdminProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const avatarUrl = file
      ? `images/superadminprofile/avatar/${file.filename}`
      : undefined;

    const data =
      await this.orchestrator.createSuperAdminProfile({
        superAdminId: user.actorId,
        fullName: dto.fullName,
        title: dto.title,
        phone: dto.phone,
        notes: dto.notes,
        avatarUrl,
      });

    return {
      success: true,
      code: 'SUPER_ADMIN_PROFILE_CREATED',
      message: 'Profile created successfully',
      data,
    };
  }

  /* ================================================= */
  /* UPDATE PROFILE (🔥 with avatar replace)          */
  /* ================================================= */

  @Patch()
  @UseInterceptors(
    FileInterceptor(
      'avatar',
      superAdminProfileImageUploadOptions,
    ),
  )
  async updateProfile(
    @CurrentUser() user,
    @Body() dto: UpdateSuperAdminProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const avatarUrl = file
      ? `images/superadminprofile/avatar/${file.filename}`
      : undefined;

    const data =
      await this.orchestrator.updateSuperAdminProfile({
        superAdminId: user.actorId,
        updates: {
          ...dto,
          avatarUrl,
        },
      });

    return {
      success: true,
      code: 'SUPER_ADMIN_PROFILE_UPDATED',
      message: 'Profile updated successfully',
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

