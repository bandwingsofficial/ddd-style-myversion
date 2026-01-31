import { Injectable } from '@nestjs/common';

import { DeliveryService } from './delivery.service';
import { DeliveryStatusService } from './delivery-status.service';

import { Delivery } from '../domain/models/delivery.model';

import { ValidationError } from '../../../common/errors';

@Injectable()
export class DeliveryOrchestratorService {
  constructor(
    private readonly deliveryService: DeliveryService,
    private readonly deliveryStatusService: DeliveryStatusService,
  ) {}

  /* ================================================= */
  /* CREATE (ASSIGN RIDER)                              */
  /* ================================================= */

  async assignDelivery(params: {
    orderId: string;
    partnerId: string;
  }): Promise<Delivery> {
    const { orderId, partnerId } = params ?? {};

    if (!orderId) {
      throw new ValidationError(
        'ORDER_ID_REQUIRED',
        'Order id is required',
      );
    }

    if (!partnerId) {
      throw new ValidationError(
        'PARTNER_ID_REQUIRED',
        'Partner id is required',
      );
    }

    return this.deliveryService.assignDelivery({
      orderId,
      partnerId,
    });
  }

  /* ================================================= */
  /* STATUS TRANSITIONS                                */
  /* ================================================= */

  async pickup(deliveryId: string): Promise<Delivery> {
    if (!deliveryId) {
      throw new ValidationError(
        'DELIVERY_ID_REQUIRED',
        'Delivery id is required',
      );
    }

    return this.deliveryStatusService.markPickedUp(deliveryId);
  }

  async startTransit(deliveryId: string): Promise<Delivery> {
    if (!deliveryId) {
      throw new ValidationError(
        'DELIVERY_ID_REQUIRED',
        'Delivery id is required',
      );
    }

    return this.deliveryStatusService.markInTransit(deliveryId);
  }

  async deliver(deliveryId: string): Promise<Delivery> {
    if (!deliveryId) {
      throw new ValidationError(
        'DELIVERY_ID_REQUIRED',
        'Delivery id is required',
      );
    }

    return this.deliveryStatusService.markDelivered(deliveryId);
  }

  async fail(deliveryId: string): Promise<Delivery> {
    if (!deliveryId) {
      throw new ValidationError(
        'DELIVERY_ID_REQUIRED',
        'Delivery id is required',
      );
    }

    return this.deliveryStatusService.markFailed(deliveryId);
  }

  /* ================================================= */
  /* LOCATION                                          */
  /* ================================================= */

  async updateLocation(params: {
    deliveryId: string;
    lat: number;
    lng: number;
  }): Promise<void> {
    const { deliveryId, lat, lng } = params ?? {};

    if (!deliveryId) {
      throw new ValidationError(
        'DELIVERY_ID_REQUIRED',
        'Delivery id is required',
      );
    }

    await this.deliveryStatusService.markLocationUpdated(
      deliveryId,
      lat,
      lng,
    );
  }

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  async getById(deliveryId: string): Promise<Delivery> {
    return this.deliveryService.getById(deliveryId);
  }

  async getByOrderId(orderId: string): Promise<Delivery | null> {
    return this.deliveryService.getByOrderId(orderId);
  }

  async getPartnerDeliveries(
    partnerId: string,
  ): Promise<Delivery[]> {
    return this.deliveryService.getPartnerDeliveries(partnerId);
  }
}
