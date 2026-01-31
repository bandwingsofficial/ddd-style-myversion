import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { DeliveryRepository } from '../repositories/delivery.repository';
import { DeliveryEventRepository } from '../repositories/delivery-event.repository';
import { DeliveryLocationRepository } from '../repositories/delivery-location.repository';

import { Delivery } from '../domain/models/delivery.model';

import { ValidationError } from '../../../common/errors';

import { DeliveryEventType } from '@prisma/client';

import { OrderStatusService } from '../../orders/services/order-status.service';
import { DeliveryEventsService } from '../events/delivery-events.service';

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deliveryRepo: DeliveryRepository,
    private readonly deliveryEventRepo: DeliveryEventRepository,
    private readonly locationRepo: DeliveryLocationRepository,
    private readonly orderStatusService: OrderStatusService,
    private readonly deliveryEvents: DeliveryEventsService,
  ) {}

  /* ================================================= */
/* ASSIGN DELIVERY                                  */
/* ================================================= */

async assignDelivery(params: {
  orderId: string;
  partnerId: string;
}): Promise<Delivery> {
  const { orderId, partnerId } = params ?? {};

  if (!orderId) {
    throw new ValidationError('ORDER_ID_REQUIRED', 'Order id required');
  }

  if (!partnerId) {
    throw new ValidationError('PARTNER_ID_REQUIRED', 'Partner id required');
  }

  /* ================================================= */
  /* PHASE 1 — DB ONLY                                 */
  /* ================================================= */

  const saved = await this.prisma.$transaction(async (tx) => {
    const delivery = Delivery.createNew({
      id: crypto.randomUUID(),
      orderId,
      partnerId,
    });

    const saved = await this.deliveryRepo.create(delivery, tx);

    await this.deliveryEventRepo.create(
      {
        deliveryId: saved.id,
        type: DeliveryEventType.ASSIGNED,
      },
      tx,
    );

    return saved;
  });

  /* ================================================= */
  /* 🔥 EMIT AFTER COMMIT (CRITICAL)                    */
  /* ================================================= */

  this.deliveryEvents.emitAssigned({
    deliveryId: saved.id,
    orderId: saved.orderId,
    riderId: saved.partnerId,
    occurredAt: new Date(),
  });

  return saved;
}

  /* ================================================= */
/* PICKUP                                           */
/* ================================================= */

async pickup(deliveryId: string): Promise<Delivery> {
  /* ================================================= */
  /* PHASE 1 — DB ONLY                                 */
  /* ================================================= */

  const updated = await this.prisma.$transaction(async (tx) => {
    const delivery = await this.deliveryRepo.findById(deliveryId, tx);

    if (!delivery) {
      throw new ValidationError(
        'DELIVERY_NOT_FOUND',
        'Delivery not found',
      );
    }

    /* 🔥 domain transition */
    const updated = delivery.markPickedUp();

    /* persist delivery */
    await this.deliveryRepo.update(updated, tx);

    /* timeline event */
    await this.deliveryEventRepo.create(
      {
        deliveryId,
        type: DeliveryEventType.PICKED_UP,
      },
      tx,
    );

    /* 🔥 sync order state */
    await this.orderStatusService.outForDelivery(
      updated.orderId,
      tx,
    );

    return updated;
  });

  /* ================================================= */
  /* 🔥 EMIT AFTER COMMIT                              */
  /* ================================================= */

  this.deliveryEvents.emitPickedUp({
    deliveryId: updated.id,
    orderId: updated.orderId,
    riderId: updated.partnerId,
    occurredAt: new Date(),
  });

  return updated;
}
  /* ================================================= */
/* START TRANSIT                                    */
/* ================================================= */

async startTransit(deliveryId: string): Promise<Delivery> {
  /* ================================================= */
  /* PHASE 1 — DB ONLY                                 */
  /* ================================================= */

  const updated = await this.prisma.$transaction(async (tx) => {
    const delivery = await this.deliveryRepo.findById(deliveryId, tx);

    if (!delivery) {
      throw new ValidationError(
        'DELIVERY_NOT_FOUND',
        'Delivery not found',
      );
    }

    const updated = delivery.markInTransit();

    await this.deliveryRepo.update(updated, tx);

    await this.deliveryEventRepo.create(
      {
        deliveryId,
        type: DeliveryEventType.IN_TRANSIT,
      },
      tx,
    );

    return updated;
  });

  /* ================================================= */
  /* 🔥 EMIT AFTER COMMIT                              */
  /* ================================================= */

  this.deliveryEvents.emitInTransit({
  deliveryId: updated.id,
  orderId: updated.orderId,
  riderId: updated.partnerId,
  occurredAt: new Date(),
});

  return updated;
}
  /* ================================================= */
  /* LOCATION UPDATE                                  */
  /* ================================================= */

  async updateLocation(params: {
  deliveryId: string;
  lat: number;
  lng: number;
}): Promise<void> {
  await this.prisma.$transaction(async (tx) => {
    /* ---------------------------------- */
    /* persist location snapshot          */
    /* ---------------------------------- */

    await this.locationRepo.create(
      {
        deliveryId: params.deliveryId,
        lat: params.lat,
        lng: params.lng,
      },
      tx,
    );

    /* ---------------------------------- */
    /* timeline event (DB history)        */
    /* ---------------------------------- */

    await this.deliveryEventRepo.create(
      {
        deliveryId: params.deliveryId,
        type: DeliveryEventType.LOCATION_UPDATED,
        metadata: {
          lat: params.lat,
          lng: params.lng,
        },
      },
      tx,
    );
  });

  /* ---------------------------------- */
  /* 🔥 realtime socket emit (OUTSIDE TX) */
  /* ---------------------------------- */

  this.deliveryEvents.emitLocationUpdated({
    deliveryId: params.deliveryId,
    orderId: '', // optional if not needed
    latitude: params.lat,
    longitude: params.lng,
    occurredAt: new Date(),
  });
}
  /* ================================================= */
  /* DELIVERED                                        */
  /* ================================================= */

async deliver(deliveryId: string): Promise<Delivery> {
  const delivery = await this.prisma.$transaction(async (tx) => {
    const delivery = await this.deliveryRepo.findById(deliveryId, tx);

    if (!delivery) {
      throw new ValidationError('DELIVERY_NOT_FOUND', 'Delivery not found');
    }

    /* ------------------------------- */
    /* domain transition               */
    /* ------------------------------- */

    const updated = delivery.markDelivered();

    /* ------------------------------- */
    /* persist delivery                */
    /* ------------------------------- */

    await this.deliveryRepo.update(updated, tx);

    /* ------------------------------- */
    /* timeline event (DB)             */
    /* ------------------------------- */

    await this.deliveryEventRepo.create(
      {
        deliveryId,
        type: DeliveryEventType.DELIVERED,
      },
      tx,
    );

    /* ------------------------------- */
    /* sync order                     */
    /* ------------------------------- */

    await this.orderStatusService.deliver(updated.orderId, tx);

    return updated;
  });

  /* ================================= */
  /* 🔥 REALTIME SOCKET (outside TX)   */
  /* ================================= */

  this.deliveryEvents.emitDelivered({
    deliveryId: delivery.id,
    orderId: delivery.orderId,
    riderId: delivery.partnerId,
    occurredAt: new Date(),
  });

  return delivery;
}

  /* ================================================= */
  /* FAILED                                           */
  /* ================================================= */

async fail(deliveryId: string): Promise<Delivery> {
  const delivery = await this.prisma.$transaction(async (tx) => {
    const delivery = await this.deliveryRepo.findById(deliveryId, tx);

    if (!delivery) {
      throw new ValidationError('DELIVERY_NOT_FOUND', 'Delivery not found');
    }

    /* ------------------------------- */
    /* domain transition               */
    /* ------------------------------- */

    const updated = delivery.markFailed();

    /* ------------------------------- */
    /* persist delivery                */
    /* ------------------------------- */

    await this.deliveryRepo.update(updated, tx);

    /* ------------------------------- */
    /* timeline event (DB)             */
    /* ------------------------------- */

    await this.deliveryEventRepo.create(
      {
        deliveryId,
        type: DeliveryEventType.FAILED,
      },
      tx,
    );

    /* ------------------------------- */
    /* sync order                     */
    /* ------------------------------- */

    await this.orderStatusService.fail(updated.orderId, tx);

    return updated;
  });

  /* ================================= */
  /* 🔥 REALTIME SOCKET (outside TX)   */
  /* ================================= */

  this.deliveryEvents.emitFailed({
    deliveryId: delivery.id,
    orderId: delivery.orderId,
    riderId: delivery.partnerId,
    occurredAt: new Date(),
    reason: 'DELIVERY_FAILED', // optional
  });

  return delivery;
}

  /* ================================================= */
  /* READS                                            */
  /* ================================================= */

  async getById(deliveryId: string): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findById(deliveryId);
    if (!delivery) throw new ValidationError('DELIVERY_NOT_FOUND', 'Delivery not found');
    return delivery;
  }

  async getByOrderId(orderId: string): Promise<Delivery | null> {
    return this.deliveryRepo.findByOrderId(orderId);
  }

  async getPartnerDeliveries(partnerId: string): Promise<Delivery[]> {
    return this.deliveryRepo.findAllByPartner(partnerId);
  }
}
