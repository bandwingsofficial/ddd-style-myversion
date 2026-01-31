import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { CheckoutController } from '../controllers/checkout.controller';

/* ---------------------------------------------- */
/* SERVICES                                       */
/* ---------------------------------------------- */
import { CheckoutService } from '../services/checkout.service';
import { CheckoutOrchestratorService } from '../services/checkout-orchestrator.service';
import { CheckoutPricingService } from '../services/checkout-pricing.service';

/* 🔥 NEW */
import { CheckoutEventsService } from '../events/checkout-events.service';

/* ---------------------------------------------- */
/* DEPENDENCY MODULES                             */
/* ---------------------------------------------- */
import { CartModule } from '../../cart/modules/cart.module';
import { SavedAddressModule } from '../../saved-address/modules/saved-address.module';
import { OrdersModule } from '../../orders/modules/orders.module';
import { PaymentsModule } from '../../payments/modules/payments.module';

/* ---------------------------------------------- */
/* MODULE                                         */
/* ---------------------------------------------- */

@Module({
  imports: [
    CartModule,
    SavedAddressModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [CheckoutController],
  providers: [
    /* Infrastructure */
    PrismaService,

    /* Core */
    CheckoutService,
    CheckoutOrchestratorService,
    CheckoutPricingService,

    /* 🔥 EVENTS */
    CheckoutEventsService,
  ],
  exports: [
    CheckoutService,
    CheckoutOrchestratorService,
  ],
})
export class CheckoutModule {}