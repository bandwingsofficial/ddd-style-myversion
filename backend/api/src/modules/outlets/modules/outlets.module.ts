// src/modules/outlets/outlets.module.ts

import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { OutletController } from './../controllers/outlet.controller';
import { OutletManagementController } from './../controllers/outlet-management.controller';

/* ---------------------------------------------- */
/* SERVICES                                       */
/* ---------------------------------------------- */
import { OutletOrchestratorService } from './../services/outlet-orchestrator.service';
import { OutletUserService } from './../services/outlet-user.service';
import { OutletService } from './../services/outlet.service';

/* ---------------------------------------------- */
/* REPOSITORIES                                   */
/* ---------------------------------------------- */
import { OutletUserRepository } from './../repositories/outlet-user.repository';
import { OutletRepository } from './../repositories/outlet.repository';

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

@Module({
  controllers: [OutletController, OutletManagementController],
  providers: [
    // Infrastructure
    PrismaService,

    // Orchestrator
    OutletOrchestratorService,

    // Core services
    OutletUserService,
    OutletService,

    // Repositories
    OutletUserRepository,
    OutletRepository,
    AuditLogRepository,

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
  exports: [
    OutletUserService,
    OutletService,
    OutletUserRepository,
    OutletRepository,
    OutletOrchestratorService,
    OutletEventsService,
  ],
})
export class OutletsModule {}
