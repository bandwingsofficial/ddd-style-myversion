import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { OrderController } from '../controllers/order.controller';
import { MyOrdersController } from '../controllers/my-orders.controller';
import { OrderAdminController } from '../controllers/order-admin.controller';

/* ---------------------------------------------- */
/* SERVICES                                       */
/* ---------------------------------------------- */
import { OrderService } from '../services/order.service';
import { OrderStatusService } from '../services/order-status.service';
import { OrderOrchestratorService } from '../services/order-orchestrator.service';

/* ---------------------------------------------- */
/* REPOSITORIES                                   */
/* ---------------------------------------------- */
import { OrderRepository } from '../repositories/order.repository';
import { OrderEventRepository } from '../repositories/order-event.repository';

/* ---------------------------------------------- */
/* EVENTS / GATEWAYS / LISTENERS                  */
/* ---------------------------------------------- */
import { OrderEventsService } from '../events/order-events.service';

import { OrderPublicGateway } from '../gateways/order-public.gateway';
import { OrderPublicListener } from '../listeners/order-public.listener';
import { OrderPaymentListener } from '../listeners/order-payment.listener';
import { OrderResponseMapper } from '../mappers/order-response.mapper';
import { CartModule } from '../../cart/modules/cart.module';
import { UploadsModule } from '../../uploads/uploads.module';

@Module({
  controllers: [OrderController, MyOrdersController, OrderAdminController],

  imports: [CartModule, UploadsModule],
  providers: [
    /* Infrastructure */
    PrismaService,

    /* Repositories */
    OrderRepository,
    OrderEventRepository,

    /* Core Services */
    OrderService,
    OrderStatusService,
    OrderOrchestratorService,
    OrderResponseMapper,

    /* Events */
    OrderEventsService,

    /* Gateways */
    OrderPublicGateway,

    /* Listeners */
    OrderPublicListener, // socket updates
    OrderPaymentListener, // 🔥 payment → order glue
  ],
  exports: [
    /* used by payments/checkout modules */
    OrderService,
    OrderStatusService,
    OrderOrchestratorService,
    OrderRepository,
  ],
})
export class OrdersModule {}
