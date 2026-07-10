// src/modules/categories/modules/categories.module.ts

import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { UploadsModule } from '../../uploads/uploads.module';

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
/* MAPPERS                                        */
/* ---------------------------------------------- */
import { CategoryResponseMapper } from '../mappers/category-response.mapper';

/* ---------------------------------------------- */
/* EVENTS / REALTIME                              */
/* ---------------------------------------------- */
import { CategoryEventsService } from '../events/category-events.service';
import { CategoryPublicGateway } from '../gateways/category-public.gateway';
import { CategoryPublicListener } from '../listeners/category-public.listener';

@Module({
  imports: [UploadsModule],
  controllers: [CategoryManagementController, CategoryPublicController],
  providers: [
    PrismaService,
    CategoryOrchestratorService,
    CategoryService,
    CategoryRepository,
    CategoryResponseMapper,
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
