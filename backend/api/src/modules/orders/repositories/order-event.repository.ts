import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OrderEventType, ActorType } from '@prisma/client';

@Injectable()
export class OrderEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    params: {
      orderId: string;
      type: OrderEventType;

      actorType?: ActorType;
      actorId?: string;

      note?: string;
      metadata?: any;

      idempotencyKey?: string;
    },
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    await client.orderEvent.create({
      data: {
        orderId: params.orderId,
        type: params.type,

        actorType: params.actorType,
        actorId: params.actorId,

        note: params.note,
        metadata: params.metadata,

        idempotencyKey: params.idempotencyKey,
      },
    });
  }
}
