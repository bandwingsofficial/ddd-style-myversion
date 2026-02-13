import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { PaymentController } from '../controllers/payment.controller';
import { PaymentWebhookController } from '../controllers/payment-webhook.controller';

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
/* EVENTS / GATEWAYS / LISTENERS                  */
/* ---------------------------------------------- */
import { PaymentEventsService } from '../events/payment-events.service';

import { PaymentPublicGateway } from '../gateways/payment-public.gateway';

import { PaymentPublicListener } from '../listeners/payment.listener';



/* ---------------------------------------------- */
/* DEPENDENCY MODULES                             */
/* ---------------------------------------------- */
import { OrdersModule } from '../../orders/modules/orders.module';

/* ---------------------------------------------- */
/* MODULE                                         */
/* ---------------------------------------------- */

@Module({
  imports: [
    OrdersModule, // 🔥 payment → order status updates
  ],
  controllers: [
    PaymentController,
    PaymentWebhookController, // 🔥 Razorpay webhook
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

    /* Events */
    PaymentEventsService,

    /* Gateways */
    PaymentPublicGateway,

    /* Listeners */
    PaymentPublicListener,
  ],
  exports: [
    PaymentOrchestratorService,
    PaymentService,
  ],
})
export class PaymentsModule {}
