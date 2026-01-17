import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { SavedAddressManagementController } from '../controllers/saved-address-management.controller';

/* ---------------------------------------------- */
/* SERVICES                                       */
/* ---------------------------------------------- */
import { SavedAddressOrchestratorService } from '../services/saved-address-orchestrator.service';
import { SavedAddressService } from '../services/saved-address.service';

/* ---------------------------------------------- */
/* REPOSITORIES                                   */
/* ---------------------------------------------- */
import { SavedAddressRepository } from '../repositories/saved-address.repository';

/* ---------------------------------------------- */
/* EVENTS / REALTIME                              */
/* ---------------------------------------------- */
import { SavedAddressEventsService } from '../events/saved-address-events.service';
import { SavedAddressPublicGateway } from '../gateways/saved-address-public.gateway';
import { SavedAddressPublicListener } from '../listeners/saved-address-public.listener';

@Module({
  controllers: [
    SavedAddressManagementController,
  ],
  providers: [
    // Infrastructure
    PrismaService,

    // Orchestrator
    SavedAddressOrchestratorService,

    // Core service
    SavedAddressService,

    // Repository
    SavedAddressRepository,

    // 🔥 EVENTS / REALTIME
    SavedAddressEventsService,
    SavedAddressPublicGateway,
    SavedAddressPublicListener,
  ],
  exports: [
    SavedAddressService,
    SavedAddressRepository,
    SavedAddressOrchestratorService,
    SavedAddressEventsService,
  ],
})
export class SavedAddressModule {}
