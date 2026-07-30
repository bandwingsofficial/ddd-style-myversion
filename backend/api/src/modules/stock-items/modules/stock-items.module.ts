// src/modules/stock-items/stock-items.module.ts

import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { StockItemManagementController } from '../controllers/stock-item-management.controller';

/* ---------------------------------------------- */
/* SERVICES                                       */
/* ---------------------------------------------- */
import { StockItemOrchestratorService } from '../services/stock-item-orchestrator.service';
import { StockItemService } from '../services/stock-item.service';

/* ---------------------------------------------- */
/* REPOSITORIES                                   */
/* ---------------------------------------------- */
import { StockItemRepository } from '../repositories/stock-item.repository';

/* ---------------------------------------------- */
/* EVENTS / REALTIME                              */
/* ---------------------------------------------- */
import { StockItemEventsService } from '../events/stock-item-events.service';
import { StockItemPublicGateway } from '../gateways/stock-item-public.gateway';
import { StockItemPublicListener } from '../listeners/stock-item-public.listener';

import { StockItemResponseMapper } from '../mappers/stock-item-response.mapper';

@Module({
  controllers: [StockItemManagementController],
  providers: [
    // Infrastructure
    PrismaService,

    // Orchestrator
    StockItemOrchestratorService,

    // Core service
    StockItemService,

    // Repository
    StockItemRepository,

    // Mappers
    StockItemResponseMapper,

    // 🔥 EVENTS / REALTIME
    StockItemEventsService,
    StockItemPublicGateway,
    StockItemPublicListener,
  ],
  exports: [
    StockItemService,
    StockItemRepository,
    StockItemOrchestratorService,
    StockItemEventsService,
  ],
})
export class StockItemsModule {}
