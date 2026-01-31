import { Module } from '@nestjs/common';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { DeliveryController } from '../controllers/delivery.controller';

/* ---------------------------------------------- */
/* SERVICES                                       */
/* ---------------------------------------------- */
import { DeliveryService } from '../services/delivery.service';
import { DeliveryStatusService } from '../services/delivery-status.service';
import { DeliveryOrchestratorService } from '../services/delivery-orchestrator.service';

/* ---------------------------------------------- */
/* REPOSITORIES                                   */
/* ---------------------------------------------- */
import { DeliveryRepository } from '../repositories/delivery.repository';
import { DeliveryEventRepository } from '../repositories/delivery-event.repository';
import { DeliveryLocationRepository } from '../repositories/delivery-location.repository';

/* ---------------------------------------------- */
/* EVENTS / SOCKETS                               */
/* ---------------------------------------------- */
import { DeliveryEventsService } from '../events/delivery-events.service';
import { DeliveryPublicGateway } from '../gateways/delivery-public.gateway';
import { DeliveryPublicListener } from '../listeners/delivery-public.listener';

/* ---------------------------------------------- */
/* DEPENDENCY MODULES                             */
/* ---------------------------------------------- */
import { OrdersModule } from '../../orders/modules/orders.module';

@Module({
  imports: [
    OrdersModule, // 🔥 delivery updates order state
  ],

  controllers: [
    DeliveryController,
  ],

  providers: [
    /* Repositories */
    DeliveryRepository,
    DeliveryEventRepository,
    DeliveryLocationRepository,

    /* Core */
    DeliveryService,
    DeliveryStatusService,
    DeliveryOrchestratorService,

    /* Events + realtime */
    DeliveryEventsService,
    DeliveryPublicGateway,
    DeliveryPublicListener,
  ],

  exports: [
    DeliveryService,
    DeliveryOrchestratorService,
    DeliveryEventsService,
  ],
})
export class DeliveryModule {}
