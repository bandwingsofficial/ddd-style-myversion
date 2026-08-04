import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OrderStatus } from '../domain/enums/order-status.enum';
import { OrderStatusService } from './order-status.service';
import { computeRemainingSeconds } from '../constants/order-pending.constants';
import { ActorType } from '../../auth/domain/enums/actor-type.enum';

@Injectable()
export class OrderPendingService {
  private readonly logger = new Logger(OrderPendingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly orderStatusService: OrderStatusService,
  ) {}

  /** Cancel all PAYMENT_PENDING orders whose payment window has elapsed. */
  @Cron(CronExpression.EVERY_MINUTE)
  async expireStalePendingOrdersJob(): Promise<void> {
    const expired = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PAYMENT_PENDING,
        paymentExpiresAt: { lt: new Date() },
      },
      select: { id: true },
      take: 100,
    });

    for (const row of expired) {
      try {
        await this.expirePendingOrder(row.id);
      } catch (err) {
        this.logger.warn(
          `[PendingExpiry] Failed orderId=${row.id}: ${err?.message ?? err}`,
        );
      }
    }
  }

  async expirePendingOrdersForCustomer(customerId: string): Promise<void> {
    const expired = await this.prisma.order.findMany({
      where: {
        customerId,
        status: OrderStatus.PAYMENT_PENDING,
        paymentExpiresAt: { lt: new Date() },
      },
      select: { id: true },
    });

    for (const row of expired) {
      await this.expirePendingOrder(row.id);
    }
  }

  async expirePendingOrder(
    orderId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    const order = await client.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!order || order.status !== OrderStatus.PAYMENT_PENDING) {
      return;
    }

    await client.payment.updateMany({
      where: {
        orderId,
        status: { in: ['INITIATED', 'FAILED'] },
      },
      data: { status: 'EXPIRED' },
    });

    await this.orderStatusService.cancel(
      orderId,
      {
        actorType: ActorType.SYSTEM,
        actorId: 'payment-expiry',
      },
      tx,
    );

    this.logger.log(`[PendingExpiry] Cancelled expired orderId=${orderId}`);
  }

  buildTimerMeta(paymentExpiresAt: Date | null | undefined) {
    const remainingSeconds = computeRemainingSeconds(paymentExpiresAt);
    return {
      paymentExpiresAt: paymentExpiresAt?.toISOString() ?? null,
      remainingSeconds,
      isExpired: remainingSeconds <= 0,
    };
  }
}
