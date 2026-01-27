import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { PaymentController } from '../controllers/payment.controller';

/* ---------------------------------------------- */
/* SERVICES                                       */
/* ---------------------------------------------- */
import { PaymentService } from '../services/payment.service';
import { PaymentOrchestratorService } from '../services/payment-orchestrator.service';
import { PaymentGatewayService } from '../services/payment-gateway.service';

/* ---------------------------------------------- */
/* REPOSITORIES                                   */
/* ---------------------------------------------- */
import { PaymentRepository } from '../repositories/payment.repository';


/* ---------------------------------------------- */
/* DEPENDENCY MODULES                             */
/* ---------------------------------------------- */
import { OrdersModule } from '../../orders/modules/orders.module';

/* ---------------------------------------------- */
/* MODULE                                         */
/* ---------------------------------------------- */

@Module({
  imports: [
    OrdersModule, // 🔥 payment updates order status
  ],
  controllers: [
    PaymentController, // remove if not needed yet
  ],
  providers: [
    /* Infrastructure */
    PrismaService,

    /* Repositories */
    PaymentRepository,

    /* Core Services */
    PaymentGatewayService,
    PaymentService,
    PaymentOrchestratorService,
  ],
  exports: [
    // 👇 Checkout uses this
    PaymentOrchestratorService,
    PaymentService,
  ],
})
export class PaymentsModule {}
