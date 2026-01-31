import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';

import { DeliveryOrchestratorService } from '../services/delivery-orchestrator.service';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';

@Controller('deliveries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveryController {
  constructor(
    private readonly orchestrator: DeliveryOrchestratorService,
  ) {}

  /* ================================================= */
  /* ASSIGN DELIVERY (ADMIN / SYSTEM)                  */
  /* ================================================= */

  @Post('assign')
  @Roles(ActorType.SUPER_ADMIN, ActorType.OUTLET_USER)
  async assignDelivery(
    @Body()
    body: {
      orderId: string;
      partnerId: string;
    },
  ) {
    const data = await this.orchestrator.assignDelivery(body);

    return {
      success: true,
      code: 'DELIVERY_ASSIGNED',
      message: 'Delivery assigned successfully',
      data,
    };
  }

  /* ================================================= */
  /* RIDER ACTIONS                                    */
  /* ================================================= */

  @Post(':deliveryId/pickup')
  @Roles(ActorType.DELIVERY)
  async pickup(
    @Param('deliveryId') deliveryId: string,
  ) {
    const data = await this.orchestrator.pickup(deliveryId);

    return {
      success: true,
      code: 'DELIVERY_PICKED_UP',
      message: 'Order picked up',
      data,
    };
  }

  @Post(':deliveryId/in-transit')
  @Roles(ActorType.DELIVERY)
  async startTransit(
    @Param('deliveryId') deliveryId: string,
  ) {
    const data = await this.orchestrator.startTransit(deliveryId);

    return {
      success: true,
      code: 'DELIVERY_IN_TRANSIT',
      message: 'Delivery started',
      data,
    };
  }

  @Post(':deliveryId/deliver')
  @Roles(ActorType.DELIVERY)
  async deliver(
    @Param('deliveryId') deliveryId: string,
  ) {
    const data = await this.orchestrator.deliver(deliveryId);

    return {
      success: true,
      code: 'DELIVERY_COMPLETED',
      message: 'Delivery completed',
      data,
    };
  }

  @Post(':deliveryId/fail')
  @Roles(ActorType.DELIVERY)
  async fail(
    @Param('deliveryId') deliveryId: string,
  ) {
    const data = await this.orchestrator.fail(deliveryId);

    return {
      success: true,
      code: 'DELIVERY_FAILED',
      message: 'Delivery failed',
      data,
    };
  }

  /* ================================================= */
  /* LOCATION UPDATE (HIGH FREQUENCY)                  */
  /* ================================================= */

  @Post(':deliveryId/location')
  @Roles(ActorType.DELIVERY)
  async updateLocation(
    @Param('deliveryId') deliveryId: string,
    @Body()
    body: {
      lat: number;
      lng: number;
    },
  ) {
    await this.orchestrator.updateLocation({
      deliveryId,
      lat: body.lat,
      lng: body.lng,
    });

    return {
      success: true,
      code: 'LOCATION_UPDATED',
      message: 'Location updated',
    };
  }

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  /* Rider app – my deliveries */
  @Get('me')
  @Roles(ActorType.DELIVERY)
  async myDeliveries(@CurrentUser() user) {
    const data =
      await this.orchestrator.getPartnerDeliveries(
        user.actorId,
      );

    return {
      success: true,
      code: 'DELIVERIES_FETCHED',
      data,
    };
  }

  /* Customer tracking */
  @Get('order/:orderId')
  @Roles(ActorType.CUSTOMER)
  async getByOrder(
    @Param('orderId') orderId: string,
  ) {
    const data =
      await this.orchestrator.getByOrderId(orderId);

    return {
      success: true,
      code: 'DELIVERY_FETCHED',
      data,
    };
  }
}
