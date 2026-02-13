import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

import { CustomerProfileOrchestratorService } from '../services/customer-profile-orchestrator.service';

import { CreateCustomerProfileDto } from '../dtos/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from '../dtos/update-customer-profile.dto';

import { customerProfileImageUploadOptions } from '../../../common/upload/customerprofile-image-upload.options';

/* ================================================= */
/* CONTROLLER                                       */
/* ================================================= */

@Controller('me/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.CUSTOMER)
export class CustomerProfileController {
  constructor(
    private readonly orchestrator: CustomerProfileOrchestratorService,
  ) {}

  /* ================================================= */
  /* GET PROFILE                                       */
  /* ================================================= */

  @Get()
  async getProfile(@CurrentUser() user) {
    const data = await this.orchestrator.getProfile(user.actorId);

    return {
      success: true,
      code: 'PROFILE_FETCHED',
      message: 'Profile fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* CREATE PROFILE (WITH AVATAR)                     */
  /* ================================================= */

  @Post()
  @UseInterceptors(
    FileInterceptor('avatar', customerProfileImageUploadOptions),
  )
  async createProfile(
    @CurrentUser() user,
    @Body() dto: CreateCustomerProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const avatarPath = file
      ? `images/customerprofile/avatar/${file.filename}`
      : undefined;

    const data = await this.orchestrator.createProfile({
      customerId: user.actorId,
      fullName: dto.fullName,
      email: dto.email,
      avatarUrl: avatarPath,
      gender: dto.gender,
      dob: dto.dob ? new Date(dto.dob) : undefined,
    });

    return {
      success: true,
      code: 'PROFILE_CREATED',
      message: 'Profile created successfully',
      data,
    };
  }

  /* ================================================= */
  /* UPDATE PROFILE (WITH AVATAR REPLACE)             */
  /* ================================================= */

  @Patch()
  @UseInterceptors(
    FileInterceptor('avatar', customerProfileImageUploadOptions),
  )
  async updateProfile(
    @CurrentUser() user,
    @Body() dto: UpdateCustomerProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const avatarPath = file
      ? `images/customerprofile/avatar/${file.filename}`
      : undefined;

    const data = await this.orchestrator.updateProfile({
      customerId: user.actorId,
      updates: {
        fullName: dto.fullName,
        email: dto.email,
        avatarUrl: avatarPath,
        gender: dto.gender,
        dob: dto.dob ? new Date(dto.dob) : undefined,
      },
    });

    return {
      success: true,
      code: 'PROFILE_UPDATED',
      message: 'Profile updated successfully',
      data,
    };
  }

  /* ================================================= */
  /* UPSERT PROFILE                                   */
  /* ================================================= */

  @Post('upsert')
  @UseInterceptors(
    FileInterceptor('avatar', customerProfileImageUploadOptions),
  )
  async upsertProfile(
    @CurrentUser() user,
    @Body() dto: UpdateCustomerProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const avatarPath = file
      ? `images/customerprofile/avatar/${file.filename}`
      : undefined;

    const data = await this.orchestrator.upsertProfile({
      customerId: user.actorId,
      fullName: dto.fullName,
      email: dto.email,
      avatarUrl: avatarPath,
      gender: dto.gender,
      dob: dto.dob ? new Date(dto.dob) : undefined,
    });

    return {
      success: true,
      code: 'PROFILE_SAVED',
      message: 'Profile saved successfully',
      data,
    };
  }

  /* ================================================= */
  /* DELETE PROFILE                                    */
  /* ================================================= */

  @Delete()
  async deleteProfile(@CurrentUser() user) {
    await this.orchestrator.deleteProfile(user.actorId);

    return {
      success: true,
      code: 'PROFILE_DELETED',
      message: 'Profile deleted successfully',
      data: null,
    };
  }
}
