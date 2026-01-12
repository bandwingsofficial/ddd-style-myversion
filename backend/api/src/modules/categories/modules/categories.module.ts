// src/modules/categories/categories.module.ts

import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { CategoryManagementController } from '../controllers/category-management.controller';
import { CategoryPublicController } from '../controllers/category-public.controller';

/* ---------------------------------------------- */
/* SERVICES                                       */
/* ---------------------------------------------- */
import { CategoryOrchestratorService } from '../services/category-orchestrator.service';
import { CategoryService } from '../services/category.service';

/* ---------------------------------------------- */
/* REPOSITORIES                                   */
/* ---------------------------------------------- */
import { CategoryRepository } from '../repositories/category.repository';

/* ---------------------------------------------- */
/* EVENTS / REALTIME                              */
/* ---------------------------------------------- */
import { CategoryEventsService } from '../events/category-events.service';
import { CategoryPublicGateway } from '../gateways/category-public.gateway';
import { CategoryPublicListener } from '../listeners/category-public.listener';

@Module({
  controllers: [CategoryManagementController, CategoryPublicController],
  providers: [
    // Infrastructure
    PrismaService,

    // Orchestrator
    CategoryOrchestratorService,

    // Core service
    CategoryService,

    // Repository
    CategoryRepository,

    // 🔥 EVENTS / REALTIME
    CategoryEventsService,
    CategoryPublicGateway,
    CategoryPublicListener,
  ],
  exports: [
    CategoryService,
    CategoryRepository,
    CategoryOrchestratorService,
    CategoryEventsService,
  ],
})
export class CategoriesModule {}
