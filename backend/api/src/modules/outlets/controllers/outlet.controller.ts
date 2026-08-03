// src/modules/outlets/controllers/outlet.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { OutletOrchestratorService } from '../services/outlet-orchestrator.service';

import { CreateOutletUserDto } from '../dtos/create-outlet-user.dto';
import { UpdateOutletUserDto } from '../dtos/update-outlet-user.dto';
import { ResetOutletUserPasswordDto } from '../dtos/reset-outlet-user-password.dto';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';
import {
  toOutletUserResponse,
  toOutletUserResponseList,
} from '../mappers/outlet-user.mapper';

@Controller('outlets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OutletController {
  constructor(private readonly orchestrator: OutletOrchestratorService) {}

  /* ================================================= */
  /* OUTLET USER – READS                               */
  /* ================================================= */

  @Get('users/:userId')
  async getOutletUserById(@Param('userId') userId: string) {
    const data = await this.orchestrator.getOutletUserById(userId);

    return {
      success: true,
      code: 'OUTLET_USER_FETCHED',
      message: 'Outlet user fetched successfully',
      data: data ? toOutletUserResponse(data) : null,
    };
  }

  @Get(':outletId/users')
  async getOutletUsersByOutlet(@Param('outletId') outletId: string) {
    const data = await this.orchestrator.getOutletUsersByOutlet(outletId);

    return {
      success: true,
      code: 'OUTLET_USERS_FETCHED',
      message: 'Outlet users fetched successfully',
      data: toOutletUserResponseList(data),
    };
  }

  /* ================================================= */
  /* OUTLET USER – CREATE (ADMIN ONLY)                 */
  /* ================================================= */

  @Post('users')
  @Roles(ActorType.SUPER_ADMIN)
  async createOutletUser(
    @Body() dto: CreateOutletUserDto,
    @CurrentUser() user,
  ) {
    const data = await this.orchestrator.createOutletUser({
      outletId: dto.outletId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      role: dto.role,
      rawPassword: dto.password,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_USER_CREATED',
      message: 'Outlet user created successfully',
      data: toOutletUserResponse(data),
    };
  }

  @Post('users/:userId/update')
  @Roles(ActorType.SUPER_ADMIN)
  async updateOutletUser(
    @Param('userId') userId: string,
    @Body() dto: UpdateOutletUserDto,
    @CurrentUser() user,
  ) {
    const data = await this.orchestrator.updateOutletUser({
      outletUserId: userId,
      name: dto.name,
      phone: dto.phone,
      role: dto.role,
      outletId: dto.outletId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_USER_UPDATED',
      message: 'Outlet user updated successfully',
      data: toOutletUserResponse(data),
    };
  }

  @Delete('users/:userId')
  @Roles(ActorType.SUPER_ADMIN)
  async deleteOutletUser(@Param('userId') userId: string, @CurrentUser() user) {
    const data = await this.orchestrator.deleteOutletUser({
      outletUserId: userId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_USER_DELETED',
      message: 'Outlet user deleted permanently',
      data,
    };
  }

  /* ================================================= */
  /* OUTLET USER – RESET PASSWORD (ADMIN ONLY)         */
  /* ================================================= */

  @Post('users/reset-password')
  @Roles(ActorType.SUPER_ADMIN)
  async resetOutletUserPassword(
    @Body() dto: ResetOutletUserPasswordDto,
    @CurrentUser() user,
  ) {
    const data = await this.orchestrator.resetOutletUserPassword({
      email: dto.email,
      newRawPassword: dto.newPassword,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_USER_PASSWORD_RESET',
      message: 'Outlet user password reset successfully',
      data,
    };
  }

  /* ================================================= */
  /* OUTLET USER – DISABLE / ENABLE (ADMIN ONLY)       */
  /* ================================================= */

  @Post('users/:userId/disable')
  @Roles(ActorType.SUPER_ADMIN)
  async disableOutletUser(
    @Param('userId') userId: string,
    @CurrentUser() user,
  ) {
    const data = await this.orchestrator.disableOutletUser({
      outletUserId: userId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_USER_DISABLED',
      message: 'Outlet user disabled successfully',
      data,
    };
  }

  @Post('users/:userId/enable')
  @Roles(ActorType.SUPER_ADMIN)
  async enableOutletUser(@Param('userId') userId: string, @CurrentUser() user) {
    const data = await this.orchestrator.enableOutletUser({
      outletUserId: userId,
      adminId: user.actorId,
    });

    return {
      success: true,
      code: 'OUTLET_USER_ENABLED',
      message: 'Outlet user enabled successfully',
      data,
    };
  }
}
