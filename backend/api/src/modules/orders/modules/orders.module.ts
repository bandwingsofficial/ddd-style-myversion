import { Module } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

/* ---------------------------------------------- */
/* CONTROLLERS                                    */
/* ---------------------------------------------- */
import { OrderController } from '../controllers/order.controller';
import {MyOrdersController} from '../controllers/my-orders.controller'

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
import { OrderItemRepository } from '../repositories/order-item.repository';

/* ---------------------------------------------- */
/* MODULE                                         */
/* ---------------------------------------------- */

@Module({
  controllers: [
    OrderController,
    MyOrdersController // remove if you don’t have one yet
  ],
  providers: [
    /* Infrastructure */
    PrismaService,

    /* Repositories */
    OrderRepository,
    OrderItemRepository,

    /* Core Services */
    OrderService,
    OrderStatusService,
    OrderOrchestratorService,
  ],
  exports: [
    // 👇 other modules (Checkout/Payments) use this
    OrderService,
    OrderStatusService,
    OrderOrchestratorService,
    OrderRepository,
    OrderItemRepository,
  ],
})
export class OrdersModule {}
