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
import { OutletResolutionService } from './../services/outlet-resolution.service';
import { OutletUserService } from './../services/outlet-user.service';
import { OutletService } from './../services/outlet.service';
import { OutletProductService } from './../services/outlet-product.service';

/* ---------------------------------------------- */
/* PROFILE                                        */
/* ---------------------------------------------- */
import { OutletProfileController } from './../controllers/outlet-profile.controller';
import { OutletProfileService } from './../services/outlet-profile.service';
import { OutletProfileRepository } from './../repositories/outlet-profile.repository';

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
import { AuthSessionRepository } from '../../auth/repositories/auth-session.repository';
import { RefreshTokenRepository } from '../../auth/repositories/refresh-token.repository';
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
import { ProductsModule } from '../../products/modules/products.module';
import { PaymentsModule } from '../../payments/modules/payments.module';

@Module({
  controllers: [
    OutletController,
    OutletManagementController,
    PublicOutletController,
    MyOutletController,
    OutletOrderController,
    OutletProfileController,
  ],
  providers: [
    // Infrastructure
    PrismaService,

    // Orchestrator
    OutletOrchestratorService,
    OutletResolutionService,

    // Core services
    OutletUserService,
    OutletService,
    OutletProductService,
    OutletProfileService,

    // Repositories
    OutletUserRepository,
    OutletRepository,
    AuditLogRepository,
    AuthSessionRepository,
    RefreshTokenRepository,
    OutletProductRepository,
    OutletProfileRepository,

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
  imports: [OrdersModule, ProductsModule, PaymentsModule],
  exports: [
    OutletUserService,
    OutletService,
    OutletProductService,
    OutletUserRepository,
    OutletRepository,
    OutletProductRepository,
    OutletOrchestratorService,
    OutletResolutionService,
    OutletEventsService,
    OutletProfileService,
  ],
})
export class OutletsModule {}
