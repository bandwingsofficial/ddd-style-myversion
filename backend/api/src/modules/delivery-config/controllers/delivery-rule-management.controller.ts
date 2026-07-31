import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ActorType } from '../../auth/domain/enums/actor-type.enum';

import { DeliveryConfigOrchestratorService } from '../services/delivery-config-orchestrator.service';
import {
  CreateDeliveryRuleDto,
  UpdateDeliveryRuleDto,
} from '../dtos/delivery-rule.dto';

@Controller('delivery-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.SUPER_ADMIN)
export class DeliveryRuleManagementController {
  constructor(
    private readonly orchestrator: DeliveryConfigOrchestratorService,
  ) {}

  @Get()
  async listRules() {
    const data = await this.orchestrator.listRules();
    return {
      success: true,
      message: 'Delivery rules fetched successfully',
      data,
    };
  }

  @Get(':ruleId')
  async getRule(@Param('ruleId') ruleId: string) {
    const data = await this.orchestrator.getRuleById(ruleId);
    return {
      success: true,
      message: 'Delivery rule fetched successfully',
      data,
    };
  }

  @Post()
  async createRule(@Body() dto: CreateDeliveryRuleDto) {
    const data = await this.orchestrator.createRule(dto);
    return {
      success: true,
      message: 'Delivery rule created successfully',
      data,
    };
  }

  @Patch(':ruleId')
  async updateRule(
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateDeliveryRuleDto,
  ) {
    const data = await this.orchestrator.updateRule({ ruleId, ...dto });
    return {
      success: true,
      message: 'Delivery rule updated successfully',
      data,
    };
  }

  @Patch(':ruleId/activate')
  async activateRule(@Param('ruleId') ruleId: string) {
    const data = await this.orchestrator.activateRule(ruleId);
    return {
      success: true,
      message: 'Delivery rule activated successfully',
      data,
    };
  }

  @Patch(':ruleId/deactivate')
  async deactivateRule(@Param('ruleId') ruleId: string) {
    const data = await this.orchestrator.deactivateRule(ruleId);
    return {
      success: true,
      message: 'Delivery rule deactivated successfully',
      data,
    };
  }

  @Delete(':ruleId')
  async deleteRule(@Param('ruleId') ruleId: string) {
    const data = await this.orchestrator.deleteRule(ruleId);
    return {
      success: true,
      message: 'Delivery rule deleted successfully',
      data,
    };
  }
}
