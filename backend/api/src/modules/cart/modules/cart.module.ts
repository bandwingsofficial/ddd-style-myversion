// src/modules/cart/modules/cart.module.ts

import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { DeliveryConfigModule } from '../../delivery-config/modules/delivery-config.module';
import { UploadsModule } from '../../uploads/uploads.module';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { CartManagementController } from '../controllers/cart-management.controller';

/* ---------------------------------------------- */
/* SERVICES                                       */
/* ---------------------------------------------- */
import { CartService } from '../services/cart.service';
import { CartOrchestratorService } from '../services/cart-orchestrator.service';

/* ---------------------------------------------- */
/* REPOSITORIES                                   */
/* ---------------------------------------------- */
import { CartRepository } from '../repositories/cart.repository';
import { CartResponseMapper } from '../mappers/cart-response.mapper';
import { PricingEngineService } from '../../../common/services/pricing-engine.service';

@Module({
  imports: [DeliveryConfigModule, UploadsModule],
  controllers: [CartManagementController],
  providers: [
    // Infrastructure
    PrismaService,

    // Core
    CartService,
    CartOrchestratorService,
    CartResponseMapper,
    PricingEngineService,

    // Repositories
    CartRepository,
  ],
  exports: [CartService, CartOrchestratorService, CartResponseMapper],
})
export class CartModule {}
