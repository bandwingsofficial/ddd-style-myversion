import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { UploadsModule } from '../../uploads/uploads.module';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { ProductManagementController } from '../controllers/product-management.controller';
import { PublicProductController } from '../controllers/public-product.controller';

/* ---------------------------------------------- */
/* SERVICES                                       */
/* ---------------------------------------------- */
import { ProductService } from '../services/product.service';
import { ProductOrchestratorService } from '../services/product-orchestrator.service';

/* ---------------------------------------------- */
/* REPOSITORIES                                   */
/* ---------------------------------------------- */
import { ProductRepository } from '../repositories/product.repository';

/* ---------------------------------------------- */
/* MAPPERS                                        */
/* ---------------------------------------------- */
import { ProductResponseMapper } from '../mappers/product-response.mapper';

/* ---------------------------------------------- */
/* DEPENDENCY MODULES                             */
/* ---------------------------------------------- */
import { StockItemsModule } from '../../stock-items/modules/stock-items.module';
import { CategoriesModule } from '../../categories/modules/categories.module';

/* ---------------------------------------------- */
/* EVENTS / REALTIME                              */
/* ---------------------------------------------- */
import { ProductEventsService } from '../events/product-events.service';
import { ProductPublicGateway } from '../gateways/product-public.gateway';
import { ProductPublicListener } from '../listeners/product-public.listener';


@Module({
  imports: [
    UploadsModule,
    StockItemsModule,
    CategoriesModule,
  ],
  controllers: [
    ProductManagementController,
    PublicProductController,
  ],
  providers: [
    PrismaService,
    ProductService,
    ProductOrchestratorService,
    ProductRepository,
    ProductResponseMapper,
    ProductEventsService,
    ProductPublicGateway,
    ProductPublicListener,
  ],
  exports: [
    ProductService,
    ProductOrchestratorService,
  ],
})
export class ProductsModule {}
