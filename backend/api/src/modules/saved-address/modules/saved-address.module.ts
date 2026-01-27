// src/modules/customer/saved-address.module.ts

import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/* ---------------------------------------------- */
/* ⭐ IMPORT OUTLETS MODULE (REQUIRED)             */
/* ---------------------------------------------- */
import { OutletsModule } from '../../outlets/modules/outlets.module';

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
  /* ================================================= */
  /* ⭐ CRITICAL: IMPORT MODULE THAT EXPORTS SERVICE    */
  /* ================================================= */
  imports: [
    OutletsModule, // ⭐⭐⭐ REQUIRED FOR OutletOrchestratorService ⭐⭐⭐
  ],

  controllers: [
    SavedAddressManagementController,
  ],

  providers: [
    /* Infrastructure */
    PrismaService,

    /* Core */
    SavedAddressOrchestratorService,
    SavedAddressService,

    /* Repository */
    SavedAddressRepository,

    /* Events / Realtime */
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
