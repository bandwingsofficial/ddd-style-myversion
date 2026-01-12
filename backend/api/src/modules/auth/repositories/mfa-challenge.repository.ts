// src/modules/auth/repositories/mfa-challenge.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { ActorType } from '../domain/enums/actor-type.enum';
import { MfaChallenge } from '../domain/models/mfa-challenge.model';
import { ActorTypeMapper } from '../mappers/actor-type.mapper';

import { ActorType as PrismaActorType } from '@prisma/client';
import { InvariantViolationError } from '../../../common/errors';

const MFA_CHALLENGE_TTL_SECONDS = 300; // 5 minutes

@Injectable()
export class MfaChallengeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ------------------------------------------------ */
  /* CREATE                                           */
  /* ------------------------------------------------ */

  async create(
    params: {
      actorType: ActorType;
      actorId: string;
      ipAddress?: string;
      userAgent?: string;
    },
    tx?: PrismaTransaction,
  ): Promise<MfaChallenge> {
    const client = tx ?? this.prisma;

    const expiresAt = new Date(
      Date.now() + MFA_CHALLENGE_TTL_SECONDS * 1000,
    );

    const row = await client.mfaChallenge.create({
      data: {
        actorType: ActorTypeMapper.toPrisma(params.actorType),
        actorId: params.actorId,
        expiresAt,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });

    return this.toDomain(row);
  }

  /* ------------------------------------------------ */
  /* READ                                             */
  /* ------------------------------------------------ */

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<MfaChallenge | null> {
    const client = tx ?? this.prisma;

    const row = await client.mfaChallenge.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  /* ------------------------------------------------ */
  /* VERIFY (STRICT + IDEMPOTENT)                      */
  /* ------------------------------------------------ */

  async markVerified(
    challengeId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    const now = new Date();

    const result = await client.mfaChallenge.updateMany({
      where: {
        id: challengeId,
        verifiedAt: null,
        expiresAt: { gt: now },
      },
      data: {
        verifiedAt: now,
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'MFA_CHALLENGE_INVALID',
        'MFA challenge is invalid, expired, or already used',
        { challengeId },
      );
    }
  }

  /* ------------------------------------------------ */
  /* CLEANUP                                          */
  /* ------------------------------------------------ */

  async deleteExpired(
    tx?: PrismaTransaction,
  ): Promise<number> {
    const client = tx ?? this.prisma;

    const result = await client.mfaChallenge.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return result.count;
  }

  /* ------------------------------------------------ */
  /* PRIVATE MAPPER                                   */
  /* ------------------------------------------------ */

  private toDomain(row: {
    id: string;
    actorType: PrismaActorType;
    actorId: string;
    expiresAt: Date;
    verifiedAt: Date | null;
    createdAt: Date;
  }): MfaChallenge {
    return MfaChallenge.rehydrate({
      id: row.id,
      actorType: ActorTypeMapper.toDomain(row.actorType),
      actorId: row.actorId,
      expiresAt: row.expiresAt,
      verifiedAt: row.verifiedAt ?? undefined,
      createdAt: row.createdAt,
    });
  }
}
