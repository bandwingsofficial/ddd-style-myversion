import { Injectable } from '@nestjs/common';

import {
  PrismaService,
} from '../../../infrastructure/prisma/prisma.service';
import {
  PrismaTransaction,
} from '../../../infrastructure/prisma/prisma.types';

import {
  Prisma,
  DeliveryEventType,
} from '@prisma/client';

import { ValidationError } from '../../../common/errors';

@Injectable()
export class DeliveryEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE (TX SAFE)                                  */
  /* ================================================= */

  async create(
    params: {
      deliveryId: string;
      type: DeliveryEventType;

      /* 🔥 FIX HERE */
      metadata?: Prisma.InputJsonValue;
    },
    tx?: PrismaTransaction,
  ): Promise<void> {
    if (!params?.deliveryId) {
      throw new ValidationError(
        'DELIVERY_ID_REQUIRED',
        'Delivery id is required',
      );
    }

    if (!params?.type) {
      throw new ValidationError(
        'DELIVERY_EVENT_TYPE_REQUIRED',
        'Delivery event type is required',
      );
    }

    const client = tx ?? this.prisma;

    await client.deliveryEvent.create({
      data: {
        deliveryId: params.deliveryId,
        type: params.type,

        /* 🔥 now perfectly typed */
        metadata: params.metadata,
      },
    });
  }

  /* ================================================= */
  /* READ (ALL BY DELIVERY)                             */
  /* ================================================= */

  async findAllByDeliveryId(
    deliveryId: string,
    tx?: PrismaTransaction,
  ) {
    if (!deliveryId) return [];

    return (tx ?? this.prisma).deliveryEvent.findMany({
      where: { deliveryId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /* ================================================= */
  /* READ (LATEST)                                      */
  /* ================================================= */

  async findLatest(
    deliveryId: string,
    tx?: PrismaTransaction,
  ) {
    if (!deliveryId) return null;

    return (tx ?? this.prisma).deliveryEvent.findFirst({
      where: { deliveryId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /* ================================================= */
  /* DELETE                                            */
  /* ================================================= */

  async deleteAll(
    deliveryId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    await (tx ?? this.prisma).deliveryEvent.deleteMany({
      where: { deliveryId },
    });
  }
}
