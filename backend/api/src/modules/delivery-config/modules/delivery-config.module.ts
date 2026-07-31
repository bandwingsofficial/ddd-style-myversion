import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { DeliveryRuleManagementController } from '../controllers/delivery-rule-management.controller';
import { DeliveryConfigPublicController } from '../controllers/delivery-config-public.controller';

import { DeliveryConfigOrchestratorService } from '../services/delivery-config-orchestrator.service';
import { DeliveryRuleService } from '../services/delivery-rule.service';
import { DeliveryChargeService } from '../services/delivery-charge.service';

import { DeliveryRuleRepository } from '../repositories/delivery-rule.repository';

@Module({
  controllers: [
    DeliveryRuleManagementController,
    DeliveryConfigPublicController,
  ],
  providers: [
    PrismaService,
    DeliveryConfigOrchestratorService,
    DeliveryRuleService,
    DeliveryChargeService,
    DeliveryRuleRepository,
  ],
  exports: [
    DeliveryChargeService,
    DeliveryRuleService,
    DeliveryConfigOrchestratorService,
  ],
})
export class DeliveryConfigModule {}
