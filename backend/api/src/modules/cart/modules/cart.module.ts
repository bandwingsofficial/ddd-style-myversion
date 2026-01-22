// src/modules/cart/modules/cart.module.ts

import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

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

@Module({
  imports: [
    // no dependency modules for now
  ],
  controllers: [
    CartManagementController,
  ],
  providers: [
    // Infrastructure
    PrismaService,

    // Core
    CartService,
    CartOrchestratorService,

    // Repositories
    CartRepository,
  ],
  exports: [
    CartService,
    CartOrchestratorService,
  ],
})
export class CartModule {}
