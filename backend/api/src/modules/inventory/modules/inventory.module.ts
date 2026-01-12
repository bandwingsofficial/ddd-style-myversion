import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { InventoryAdminController } from '../controllers/inventory-admin.controller';
import { InventoryPublicController } from '../controllers/inventory-public.controller';

/* ---------------------------------------------- */
/* SERVICES                                       */
/* ---------------------------------------------- */
import { InventoryService } from '../services/inventory.service';
import { InventoryOrchestratorService } from '../services/inventory-orchestrator.service';

/* ---------------------------------------------- */
/* REPOSITORIES                                   */
/* ---------------------------------------------- */
import { CentralInventoryRepository } from '../repositories/central-inventory.repository';
import { OutletStockRepository } from '../repositories/outlet-stock.repository';
import { StockTransactionRepository } from '../repositories/stock-transaction.repository';

/* ---------------------------------------------- */
/* EVENTS / REALTIME (OPTIONAL, FUTURE-READY)     */
/* ---------------------------------------------- */
// import { InventoryEventsService } from '../events/inventory-events.service';

/* ---------------------------------------------- */
/* DEPENDENCY MODULES                             */
/* ---------------------------------------------- */
import { StockItemsModule } from '../../stock-items/modules/stock-items.module';
import { OutletsModule } from '../../outlets/modules/outlets.module';

@Module({
  imports: [
    StockItemsModule, // StockItem validation / reads
    OutletsModule,    // Outlet validation / reads
  ],
  controllers: [
    InventoryAdminController,
    InventoryPublicController,
  ],
  providers: [
    // Infrastructure
    PrismaService,

    // Core
    InventoryService,
    InventoryOrchestratorService,

    // Repositories
    CentralInventoryRepository,
    OutletStockRepository,
    StockTransactionRepository,

    // Events (optional but ready)
    // InventoryEventsService,
  ],
  exports: [
    InventoryService,
    InventoryOrchestratorService,
  ],
})
export class InventoryModule {}
