import {
  Delivery as PrismaDelivery,
  DeliveryTripStatus as PrismaDeliveryStatus,
} from '@prisma/client';

import { Delivery } from '../domain/models/delivery.model';
import { DeliveryStatus } from '../domain/enums/delivery-status.enum';

/* ================================================= */
/* DELIVERY MAPPER                                   */
/* Prisma ↔ Domain                                   */
/* ================================================= */

export class DeliveryMapper {
  /* ================================================= */
  /* ENUM                                              */
  /* ================================================= */

  static toDomainStatus(
    status: PrismaDeliveryStatus,
  ): DeliveryStatus {
    switch (status) {
      case PrismaDeliveryStatus.ASSIGNED:
        return DeliveryStatus.ASSIGNED;

      case PrismaDeliveryStatus.PICKED_UP:
        return DeliveryStatus.PICKED_UP;

      case PrismaDeliveryStatus.IN_TRANSIT:
        return DeliveryStatus.IN_TRANSIT;

      case PrismaDeliveryStatus.DELIVERED:
        return DeliveryStatus.DELIVERED;

      case PrismaDeliveryStatus.FAILED:
        return DeliveryStatus.FAILED;

      default:
        throw new Error(`Unknown Prisma DeliveryTripStatus: ${status}`);
    }
  }

  static toPrismaStatus(
    status: DeliveryStatus,
  ): PrismaDeliveryStatus {
    switch (status) {
      case DeliveryStatus.ASSIGNED:
        return PrismaDeliveryStatus.ASSIGNED;

      case DeliveryStatus.PICKED_UP:
        return PrismaDeliveryStatus.PICKED_UP;

      case DeliveryStatus.IN_TRANSIT:
        return PrismaDeliveryStatus.IN_TRANSIT;

      case DeliveryStatus.DELIVERED:
        return PrismaDeliveryStatus.DELIVERED;

      case DeliveryStatus.FAILED:
        return PrismaDeliveryStatus.FAILED;

      default:
        throw new Error(`Unknown Domain DeliveryStatus: ${status}`);
    }
  }

  /* ================================================= */
  /* TO DOMAIN                                         */
  /* ================================================= */

  static toDomain(row: PrismaDelivery): Delivery {
    return Delivery.rehydrate({
      id: row.id,

      orderId: row.orderId,
      partnerId: row.partnerId,

      status: this.toDomainStatus(row.status),

      assignedAt: row.assignedAt,
      pickedUpAt: row.pickedUpAt ?? undefined,
      deliveredAt: row.deliveredAt ?? undefined,
      failedAt: row.failedAt ?? undefined,

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  /* ================================================= */
  /* CREATE                                            */
  /* ================================================= */

  static toPrismaCreate(delivery: Delivery) {
    return {
      id: delivery.id,
      orderId: delivery.orderId,
      partnerId: delivery.partnerId,
      status: this.toPrismaStatus(delivery.status),

      assignedAt: delivery.assignedAt,
      pickedUpAt: delivery.pickedUpAt,
      deliveredAt: delivery.deliveredAt,
      failedAt: delivery.failedAt,

      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
    };
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  static toPrismaUpdate(delivery: Delivery) {
    return {
      status: this.toPrismaStatus(delivery.status),

      pickedUpAt: delivery.pickedUpAt,
      deliveredAt: delivery.deliveredAt,
      failedAt: delivery.failedAt,

      updatedAt: delivery.updatedAt,
    };
  }
}
