// src/modules/auth/repositories/delivery-partner.repository.ts

import { Injectable } from '@nestjs/common';
import { Prisma, DeliveryStatus as PrismaDeliveryStatus } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { DeliveryStatus } from '../domain/enums/delivery-status.enum';
import { DeliveryPartner } from '../domain/models/delivery-partner.model';
import { Phone } from '../domain/value-objects/phone.vo';

import { DeliveryStatusMapper } from '../mappers/delivery-status.mapper';
import { InvariantViolationError } from '../../../common/errors';

type PrismaClientLike =
  | PrismaService
  | Prisma.TransactionClient;

@Injectable()
export class DeliveryPartnerRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ---------------------------------------------- */
  /* CREATE / READ                                  */
  /* ---------------------------------------------- */

  async create(
    params: { phone: Phone },
    tx?: PrismaTransaction,
  ): Promise<DeliveryPartner> {
    const client = tx ?? this.prisma;

    const row = await client.deliveryPartner.create({
      data: {
        phone: params.phone.getRaw(),
        status: DeliveryStatusMapper.toPrisma(
          DeliveryStatus.CREATED,
        ),
      },
    });

    return this.toDomain(row);
  }

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<DeliveryPartner | null> {
    const client = tx ?? this.prisma;

    const row = await client.deliveryPartner.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByPhone(
    phone: Phone,
    tx?: PrismaTransaction,
  ): Promise<DeliveryPartner | null> {
    const client = tx ?? this.prisma;

    const row = await client.deliveryPartner.findUnique({
      where: { phone: phone.getRaw() },
    });

    return row ? this.toDomain(row) : null;
  }

  /* ---------------------------------------------- */
  /* ONBOARDING FLOW                                */
  /* ---------------------------------------------- */

  async submitKyc(
    partnerId: string,
    kycRefId: string,
    tx?: PrismaTransaction,
  ): Promise<DeliveryPartner> {
    const client = tx ?? this.prisma;

    const result = await client.deliveryPartner.updateMany({
      where: { id: partnerId },
      data: {
        status: DeliveryStatusMapper.toPrisma(
          DeliveryStatus.KYC_SUBMITTED,
        ),
        kycRefId,
        approvedAt: null,
        approvedBy: null,
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'DELIVERY_PARTNER_NOT_FOUND',
        'Delivery partner not found',
        { partnerId },
      );
    }

    return this.findByIdOrFail(partnerId, client);
  }

  async approve(
    partnerId: string,
    approvedBy: string,
    approvedAt: Date,
    tx?: PrismaTransaction,
  ): Promise<DeliveryPartner> {
    const client = tx ?? this.prisma;

    const result = await client.deliveryPartner.updateMany({
      where: { id: partnerId },
      data: {
        status: DeliveryStatusMapper.toPrisma(
          DeliveryStatus.APPROVED,
        ),
        approvedBy,
        approvedAt,
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'DELIVERY_PARTNER_NOT_FOUND',
        'Delivery partner not found',
        { partnerId },
      );
    }

    return this.findByIdOrFail(partnerId, client);
  }

  /* ---------------------------------------------- */
  /* ADMIN ACTIONS                                  */
  /* ---------------------------------------------- */

  async suspend(
    partnerId: string,
    tx?: PrismaTransaction,
  ): Promise<DeliveryPartner> {
    return this.updateStatus(
      partnerId,
      DeliveryStatus.SUSPENDED,
      tx,
    );
  }

  async block(
    partnerId: string,
    tx?: PrismaTransaction,
  ): Promise<DeliveryPartner> {
    return this.updateStatus(
      partnerId,
      DeliveryStatus.BLOCKED,
      tx,
    );
  }

  /* ---------------------------------------------- */
  /* SECURITY                                       */
  /* ---------------------------------------------- */

  async incrementTokenVersion(
    partnerId: string,
    tx?: PrismaTransaction,
  ): Promise<DeliveryPartner> {
    const client = tx ?? this.prisma;

    const result = await client.deliveryPartner.updateMany({
      where: { id: partnerId },
      data: {
        tokenVersion: { increment: 1 },
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'DELIVERY_PARTNER_NOT_FOUND',
        'Delivery partner not found',
        { partnerId },
      );
    }

    return this.findByIdOrFail(partnerId, client);
  }

  /* ---------------------------------------------- */
  /* INTERNAL HELPERS                               */
  /* ---------------------------------------------- */

  private async updateStatus(
    partnerId: string,
    status: DeliveryStatus,
    tx?: PrismaTransaction,
  ): Promise<DeliveryPartner> {
    const client = tx ?? this.prisma;

    const result = await client.deliveryPartner.updateMany({
      where: { id: partnerId },
      data: {
        status: DeliveryStatusMapper.toPrisma(status),
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'DELIVERY_PARTNER_NOT_FOUND',
        'Delivery partner not found',
        { partnerId },
      );
    }

    return this.findByIdOrFail(partnerId, client);
  }

  private async findByIdOrFail(
    partnerId: string,
    client: PrismaClientLike,
  ): Promise<DeliveryPartner> {
    const row = await client.deliveryPartner.findUnique({
      where: { id: partnerId },
    });

    if (!row) {
      throw new InvariantViolationError(
        'DELIVERY_PARTNER_NOT_FOUND',
        'Delivery partner not found',
        { partnerId },
      );
    }

    return this.toDomain(row);
  }

  /* ---------------------------------------------- */
  /* PRIVATE MAPPER                                 */
  /* ---------------------------------------------- */

  private toDomain(row: {
    id: string;
    phone: string;
    status: PrismaDeliveryStatus;
    kycRefId: string | null;
    approvedAt: Date | null;
    approvedBy: string | null;
    tokenVersion: number;
    createdAt: Date;
  }): DeliveryPartner {
    return DeliveryPartner.rehydrate({
      id: row.id,
      phone: Phone.fromRaw(row.phone),
      status: DeliveryStatusMapper.toDomain(row.status),
      kycRefId: row.kycRefId ?? undefined,
      approvedAt: row.approvedAt ?? undefined,
      approvedBy: row.approvedBy ?? undefined,
      tokenVersion: row.tokenVersion,
      createdAt: row.createdAt,
    });
  }
}
