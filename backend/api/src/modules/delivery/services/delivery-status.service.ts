import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';
import { Prisma, DeliveryEventType } from '@prisma/client';

import { DeliveryRepository } from '../repositories/delivery.repository';
import { DeliveryEventRepository } from '../repositories/delivery-event.repository';

import { Delivery } from '../domain/models/delivery.model';

import { ValidationError } from '../../../common/errors';

@Injectable()
export class DeliveryStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deliveryRepo: DeliveryRepository,
    private readonly deliveryEventRepo: DeliveryEventRepository,
  ) {}

  /* ================================================= */
  /* GENERIC TRANSITION WRAPPER                        */
  /* ================================================= */

  private async transition(
    deliveryId: string,
    transitionFn: (delivery: Delivery) => Delivery,
    eventType: DeliveryEventType,
    metadata?: Prisma.InputJsonValue, // ✅ FIXED
    tx?: PrismaTransaction,
  ): Promise<Delivery> {
    if (!deliveryId) {
      throw new ValidationError(
        'DELIVERY_ID_REQUIRED',
        'Delivery id is required',
      );
    }

    const client = tx ?? this.prisma;

    if (tx) {
      return this.transitionInternal(
        deliveryId,
        transitionFn,
        eventType,
        metadata,
        client,
      );
    }

    return this.prisma.$transaction((trx) =>
      this.transitionInternal(
        deliveryId,
        transitionFn,
        eventType,
        metadata,
        trx,
      ),
    );
  }

  private async transitionInternal(
    deliveryId: string,
    transitionFn: (delivery: Delivery) => Delivery,
    eventType: DeliveryEventType,
    metadata: Prisma.InputJsonValue | undefined, // ✅ FIXED
    client: PrismaTransaction,
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findById(deliveryId, client);

    if (!delivery) {
      throw new ValidationError(
        'DELIVERY_NOT_FOUND',
        'Delivery not found',
      );
    }

    /* 🔥 domain transition */
    const updated = transitionFn(delivery);

    /* 🔥 persist delivery */
    await this.deliveryRepo.update(updated, client);

    /* 🔥 persist timeline event */
    await this.deliveryEventRepo.create(
      {
        deliveryId: updated.id,
        type: eventType,
        metadata, // ✅ now perfectly typed
      },
      client,
    );

    return updated;
  }

  /* ================================================= */
  /* STATUS METHODS                                    */
  /* ================================================= */

  async markAssigned(deliveryId: string, tx?: PrismaTransaction): Promise<Delivery> {
    return this.transition(
      deliveryId,
      (d) => d,
      DeliveryEventType.ASSIGNED,
      undefined,
      tx,
    );
  }

  async markPickedUp(deliveryId: string, tx?: PrismaTransaction): Promise<Delivery> {
    return this.transition(
      deliveryId,
      (d) => d.markPickedUp(),
      DeliveryEventType.PICKED_UP,
      undefined,
      tx,
    );
  }

  async markInTransit(deliveryId: string, tx?: PrismaTransaction): Promise<Delivery> {
    return this.transition(
      deliveryId,
      (d) => d.markInTransit(),
      DeliveryEventType.IN_TRANSIT,
      undefined,
      tx,
    );
  }

  async markDelivered(deliveryId: string, tx?: PrismaTransaction): Promise<Delivery> {
    return this.transition(
      deliveryId,
      (d) => d.markDelivered(),
      DeliveryEventType.DELIVERED,
      undefined,
      tx,
    );
  }

  async markFailed(deliveryId: string, tx?: PrismaTransaction): Promise<Delivery> {
    return this.transition(
      deliveryId,
      (d) => d.markFailed(),
      DeliveryEventType.FAILED,
      undefined,
      tx,
    );
  }

  async markLocationUpdated(
    deliveryId: string,
    lat: number,
    lng: number,
    tx?: PrismaTransaction,
  ): Promise<void> {
    await this.transition(
      deliveryId,
      (d) => d,
      DeliveryEventType.LOCATION_UPDATED,
      { lat, lng }, // ✅ valid JSON
      tx,
    );
  }
}
