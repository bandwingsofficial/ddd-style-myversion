import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

import { OutletOrchestratorService } from '../services/outlet-orchestrator.service';

import { CreateOutletProfileDto } from '../dtos/create-outlet-profile.dto';
import { UpdateOutletProfileDto } from '../dtos/update-outlet-profile.dto';

import { UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { outletProfileImageUploadOptions } 
  from '../../../common/upload/outletprofile-image-upload.options';

/* ================================================= */
/* CONTROLLER                                       */
/* ================================================= */

@Controller('outlets/:outletId/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.OUTLET_USER)
export class OutletProfileController {
  constructor(
    private readonly orchestrator: OutletOrchestratorService,
  ) {}

  /* ================================================= */
  /* GET PROFILE                                      */
  /* ================================================= */

  @Get()
  async getProfile(@Param('outletId') outletId: string) {
    const data =
      await this.orchestrator.getOutletProfile(outletId);

    return {
      success: true,
      code: 'OUTLET_PROFILE_FETCHED',
      message: 'Outlet profile fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* CREATE                                           */
  /* ================================================= */

  @Post()
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'avatar', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ],
    outletProfileImageUploadOptions,
  ),
)
async createProfile(
  @Param('outletId') outletId: string,
  @Body() dto: CreateOutletProfileDto,
  @UploadedFiles()
  files: {
    avatar?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  },
) {
  const avatarPath = files?.avatar?.length
    ? `images/outletprofile/avatar/${files.avatar[0].filename}`
    : undefined;

  const bannerPath = files?.banner?.length
    ? `images/outletprofile/banner/${files.banner[0].filename}`
    : undefined;

  const data =
    await this.orchestrator.createOutletProfile({
      outletId,
      avatarUrl: avatarPath,
      bannerUrl: bannerPath,
      ...dto,
    });

  return {
    success: true,
    code: 'OUTLET_PROFILE_CREATED',
    message: 'Outlet profile created successfully',
    data,
  };
}
  /* ================================================= */
  /* UPDATE                                           */
  /* ================================================= */

  @Patch()
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'avatar', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ],
    outletProfileImageUploadOptions,
  ),
)
async updateProfile(
  @Param('outletId') outletId: string,
  @Body() dto: UpdateOutletProfileDto,
  @UploadedFiles()
  files: {
    avatar?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  },
) {
  const avatarPath = files?.avatar?.length
    ? `images/outletprofile/avatar/${files.avatar[0].filename}`
    : undefined;

  const bannerPath = files?.banner?.length
    ? `images/outletprofile/banner/${files.banner[0].filename}`
    : undefined;

  const data =
    await this.orchestrator.updateOutletProfile({
      outletId,
      updates: {
        avatarUrl: avatarPath,
        bannerUrl: bannerPath,
        ...dto,
      },
    });

  return {
    success: true,
    code: 'OUTLET_PROFILE_UPDATED',
    message: 'Outlet profile updated successfully',
    data,
  };
}

  /* ================================================= */
  /* UPSERT                                           */
  /* ================================================= */

  @Post('upsert')
@UseInterceptors(
  FileFieldsInterceptor(
    [
      { name: 'avatar', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ],
    outletProfileImageUploadOptions,
  ),
)
async upsertProfile(
  @Param('outletId') outletId: string,
  @Body() dto: UpdateOutletProfileDto,
  @UploadedFiles()
  files: {
    avatar?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  },
) {
  const avatarPath = files?.avatar?.length
    ? `images/outletprofile/avatar/${files.avatar[0].filename}`
    : undefined;

  const bannerPath = files?.banner?.length
    ? `images/outletprofile/banner/${files.banner[0].filename}`
    : undefined;

  const data =
    await this.orchestrator.upsertOutletProfile({
      outletId,
      avatarUrl: avatarPath,
      bannerUrl: bannerPath,
      ...dto,
    });

  return {
    success: true,
    code: 'OUTLET_PROFILE_SAVED',
    message: 'Outlet profile saved successfully',
    data,
  };
}
  /* ================================================= */
  /* DELETE                                           */
  /* ================================================= */

  @Delete()
  async deleteProfile(@Param('outletId') outletId: string) {
    await this.orchestrator.deleteOutletProfile(outletId);

    return {
      success: true,
      code: 'OUTLET_PROFILE_DELETED',
      message: 'Outlet profile deleted successfully',
      data: null,
    };
  }
}
