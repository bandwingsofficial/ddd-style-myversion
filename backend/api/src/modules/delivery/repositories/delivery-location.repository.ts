import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { ValidationError } from '../../../common/errors';

@Injectable()
export class DeliveryLocationRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE (append only – very frequent)               */
  /* ================================================= */

  async create(
    params: {
      deliveryId: string;
      lat: number;
      lng: number;
    },
    tx?: PrismaTransaction,
  ): Promise<void> {
    if (!params?.deliveryId) {
      throw new ValidationError(
        'DELIVERY_ID_REQUIRED',
        'Delivery id is required',
      );
    }

    const client = tx ?? this.prisma;

    await client.deliveryLocation.create({
      data: {
        deliveryId: params.deliveryId,
        lat: params.lat,
        lng: params.lng,
      },
    });
  }

  /* ================================================= */
  /* READ – LATEST (most common 🔥)                     */
  /* used by live tracking page                        */
  /* ================================================= */

  async findLatest(
    deliveryId: string,
    tx?: PrismaTransaction,
  ) {
    if (!deliveryId) return null;

    return (tx ?? this.prisma).deliveryLocation.findFirst({
      where: { deliveryId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /* ================================================= */
  /* READ – RECENT N (map polyline)                     */
  /* ================================================= */

  async findRecent(
    deliveryId: string,
    limit = 50,
    tx?: PrismaTransaction,
  ) {
    if (!deliveryId) return [];

    return (tx ?? this.prisma).deliveryLocation.findMany({
      where: { deliveryId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /* ================================================= */
  /* READ – ALL (history / debug only)                  */
  /* ================================================= */

  async findAll(
    deliveryId: string,
    tx?: PrismaTransaction,
  ) {
    if (!deliveryId) return [];

    return (tx ?? this.prisma).deliveryLocation.findMany({
      where: { deliveryId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /* ================================================= */
  /* DELETE – cleanup only (rare)                       */
  /* ================================================= */

  async deleteAll(
    deliveryId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    await (tx ?? this.prisma).deliveryLocation.deleteMany({
      where: { deliveryId },
    });
  }
}
