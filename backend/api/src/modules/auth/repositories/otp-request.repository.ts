// src/modules/auth/repositories/otp-request.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { ActorType } from '../domain/enums/actor-type.enum';
import { OtpPurpose } from '../domain/enums/otp-purpose.enum';
import { OtpRequest } from '../domain/models/otp-request.model';
import { Phone } from '../domain/value-objects/phone.vo';
import { TokenHash } from '../domain/value-objects/token-hash.vo';

import {
  ActorType as PrismaActorType,
  OtpPurpose as PrismaOtpPurpose,
} from '@prisma/client';

import { ActorTypeMapper } from '../mappers/actor-type.mapper';
import { OtpPurposeMapper } from '../mappers/otp-purpose.mapper';
import { InvariantViolationError } from '../../../common/errors';

@Injectable()
export class OtpRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ---------------------------------------------- */
  /* CREATE                                         */
  /* ---------------------------------------------- */

  async create(
    params: {
      actorType: ActorType;
      phone: Phone;
      purpose: OtpPurpose;
      otpHash: TokenHash;
      expiresAt: Date;
      actorId?: string;
    },
    tx?: PrismaTransaction,
  ): Promise<OtpRequest> {
    const client = tx ?? this.prisma;

    const row = await client.otpRequest.create({
      data: {
        actorType: ActorTypeMapper.toPrisma(params.actorType),
        actorId: params.actorId,
        phone: params.phone.getRaw(),
        purpose: OtpPurposeMapper.toPrisma(params.purpose),
        otpHash: params.otpHash.getRaw(),
        expiresAt: params.expiresAt,
      },
    });

    return this.toDomain(row);
  }

  /* ---------------------------------------------- */
  /* READ                                           */
  /* ---------------------------------------------- */

  async findLatestValid(
    params: {
      phone: Phone;
      purpose: OtpPurpose;
      actorType: ActorType;
      now: Date;
    },
    tx?: PrismaTransaction,
  ): Promise<OtpRequest | null> {
    const client = tx ?? this.prisma;

    const row = await client.otpRequest.findFirst({
      where: {
        phone: params.phone.getRaw(),
        purpose: OtpPurposeMapper.toPrisma(params.purpose),
        actorType: ActorTypeMapper.toPrisma(params.actorType),
        expiresAt: { gt: params.now },
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return row ? this.toDomain(row) : null;
  }

  /* ---------------------------------------------- */
  /* SECURITY UPDATES (STRICT)                       */
  /* ---------------------------------------------- */

  async incrementAttempts(
    otpRequestId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    const result = await client.otpRequest.updateMany({
      where: {
        id: otpRequestId,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        attempts: { increment: 1 },
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'OTP_REQUEST_INVALID',
        'OTP request is invalid or expired',
        { otpRequestId },
      );
    }
  }

  async markVerified(
    otpRequestId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    const result = await client.otpRequest.updateMany({
      where: {
        id: otpRequestId,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        verifiedAt: new Date(),
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'OTP_REQUEST_INVALID',
        'OTP request is invalid, expired, or already verified',
        { otpRequestId },
      );
    }
  }

  async linkActor(
    otpRequestId: string,
    actorId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    const result = await client.otpRequest.updateMany({
      where: { id: otpRequestId },
      data: { actorId },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'OTP_REQUEST_NOT_FOUND',
        'OTP request not found',
        { otpRequestId },
      );
    }
  }

  /* ---------------------------------------------- */
  /* PRIVATE MAPPER                                 */
  /* ---------------------------------------------- */

  private toDomain(row: {
    id: string;
    actorType: PrismaActorType;
    actorId: string | null;
    phone: string;
    purpose: PrismaOtpPurpose;
    otpHash: string;
    attempts: number;
    expiresAt: Date;
    verifiedAt: Date | null;
    createdAt: Date;
  }): OtpRequest {
    return OtpRequest.rehydrate({
      id: row.id,
      actorType: ActorTypeMapper.toDomain(row.actorType),
      actorId: row.actorId ?? undefined,
      phone: Phone.fromRaw(row.phone),
      purpose: OtpPurposeMapper.toDomain(row.purpose),
      otpHash: TokenHash.fromHash(row.otpHash),
      attempts: row.attempts,
      expiresAt: row.expiresAt,
      verifiedAt: row.verifiedAt ?? undefined,
      createdAt: row.createdAt,
    });
  }
}
