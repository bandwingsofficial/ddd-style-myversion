// src/modules/outlets/outlets.module.ts

import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { OutletController } from './../controllers/outlet.controller';
import { OutletManagementController } from './../controllers/outlet-management.controller';
import { PublicOutletController } from './../controllers/public-outlet.controller';
import { MyOutletController } from './../controllers/my-outlet.controller';
import { OutletOrderController } from './../controllers/outlet-order.controller';

/* ---------------------------------------------- */
/* SERVICES                                       */
/* ---------------------------------------------- */
import { OutletOrchestratorService } from './../services/outlet-orchestrator.service';
import { OutletUserService } from './../services/outlet-user.service';
import { OutletService } from './../services/outlet.service';
import { OutletProductService } from './../services/outlet-product.service';




/* ---------------------------------------------- */
/* REPOSITORIES                                   */
/* ---------------------------------------------- */
import { OutletUserRepository } from './../repositories/outlet-user.repository';
import { OutletRepository } from './../repositories/outlet.repository';
import { OutletProductRepository } from './../repositories/outlet-product.repository';

/* ---------------------------------------------- */
/* POLICIES                                       */
/* ---------------------------------------------- */
import { OutletUserActivePolicy } from './../policies/outlet-user-active.policy';
import { OutletActivePolicy } from './../policies/outlet-active.policy';
import { OutletWorkingPolicy } from './../policies/outlet-working.policy';
import { CameraOnPolicy } from './../policies/camera-on.policy';
import { CameraOffPolicy } from './../policies/camera-off.policy';

/* ---------------------------------------------- */
/* AUTH / SHARED                                  */
/* ---------------------------------------------- */
import { AuditLogRepository } from '../../auth/repositories/audit-log.repository';

/* ---------------------------------------------- */
/* EVENTS / REALTIME                               */
/* ---------------------------------------------- */
import { OutletEventsService } from './../events/outlet-events.service';
import { OutletPublicGateway } from './../gateways/outlet-public.gateway';
import { OutletPublicListener } from './../listeners/outlet-public.listener';

/* ---------------------------------------------- */
/* MODULE                                         */
/* ---------------------------------------------- */  
import { OrdersModule } from '../../orders/modules/orders.module';


@Module({
  controllers: [OutletController, OutletManagementController, PublicOutletController, MyOutletController, OutletOrderController],
  providers: [
    // Infrastructure
    PrismaService,

    // Orchestrator
    OutletOrchestratorService,

    // Core services
    OutletUserService,
    OutletService,
    OutletProductService,

    // Repositories
    OutletUserRepository,
    OutletRepository,
    AuditLogRepository,
    OutletProductRepository,


    // Policies
    OutletUserActivePolicy,
    OutletActivePolicy,
    OutletWorkingPolicy,
    CameraOnPolicy,
    CameraOffPolicy,

    // 🔥 EVENTS / REALTIME (ADD THESE)
    OutletEventsService,
    OutletPublicGateway,
    OutletPublicListener,
  ],
  imports: [
    OrdersModule, // 👈 ADD THIS
  ],
  exports: [
    OutletUserService,
    OutletService,
    OutletProductService,
    OutletUserRepository,
    OutletRepository,
    OutletProductRepository,
    OutletOrchestratorService,
    OutletEventsService,
  ],
})
export class OutletsModule {}
