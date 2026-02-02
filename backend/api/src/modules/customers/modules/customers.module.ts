import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { CustomerProfileController } from '../controllers/customer-profile.controller';

/* ---------------------------------------------- */
/* SERVICES                                       */
/* ---------------------------------------------- */
import { CustomerProfileService } from '../services/customer-profile.service';
import { CustomerProfileOrchestratorService } from '../services/customer-profile-orchestrator.service';

/* ---------------------------------------------- */
/* REPOSITORIES                                   */
/* ---------------------------------------------- */
import { CustomerProfileRepository } from '../repositories/customer-profile.repository';

@Module({
  controllers: [
    CustomerProfileController,
  ],
  providers: [
    /* Infrastructure */
    PrismaService,

    /* Core */
    CustomerProfileService,
    CustomerProfileOrchestratorService,

    /* Repository */
    CustomerProfileRepository,
  ],
  exports: [
    CustomerProfileService,
    CustomerProfileOrchestratorService,
  ],
})
export class CustomersModule {}
