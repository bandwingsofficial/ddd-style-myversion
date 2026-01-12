// src/modules/auth/repositories/auth-session.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { ActorType } from '../domain/enums/actor-type.enum';
import { AuthSession } from '../domain/models/auth-session.model';
import { DeviceInfo } from '../domain/value-objects/device-info.vo';

import { ActorType as PrismaActorType } from '@prisma/client';
import { ActorTypeMapper } from '../mappers/actor-type.mapper';

@Injectable()
export class AuthSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    params: {
      actorType: ActorType;
      actorId: string;
      deviceInfo?: DeviceInfo;
    },
    tx?: PrismaTransaction,
  ): Promise<AuthSession> {
    const client = tx ?? this.prisma;

    // ✅ SINGLE SOURCE OF TIME
    const now = new Date();

    const row = await client.authSession.create({
      data: {
        actorType: ActorTypeMapper.toPrisma(params.actorType),
        actorId: params.actorId,
        deviceId: params.deviceInfo?.deviceId,
        ipAddress: params.deviceInfo?.ipAddress,
        userAgent: params.deviceInfo?.userAgent,
        createdAt: now,   // ✅ explicit
        lastUsedAt: now,  // ✅ identical
      },
    });

    return this.toDomain(row);
  }

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<AuthSession | null> {
    const client = tx ?? this.prisma;

    const row = await client.authSession.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findActiveByActor(
    actorType: ActorType,
    actorId: string,
    tx?: PrismaTransaction,
  ): Promise<AuthSession[]> {
    const client = tx ?? this.prisma;

    const rows = await client.authSession.findMany({
      where: {
        actorType: ActorTypeMapper.toPrisma(actorType),
        actorId,
        revokedAt: null,
      },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async revoke(sessionId: string, tx?: PrismaTransaction): Promise<void> {
    const client = tx ?? this.prisma;

    await client.authSession.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllForActor(
    actorType: ActorType,
    actorId: string,
    tx?: PrismaTransaction,
  ): Promise<number> {
    const client = tx ?? this.prisma;

    const result = await client.authSession.updateMany({
      where: {
        actorType: ActorTypeMapper.toPrisma(actorType),
        actorId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return result.count;
  }

  async touch(sessionId: string, tx?: PrismaTransaction): Promise<void> {
    const client = tx ?? this.prisma;

    await client.authSession.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: {
        lastUsedAt: new Date(), // OK for updates
      },
    });
  }

  /* ---------------------------------------------- */
  /* PRIVATE MAPPER                                 */
  /* ---------------------------------------------- */

  private toDomain(row: {
    id: string;
    actorType: PrismaActorType;
    actorId: string;
    deviceId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    lastUsedAt: Date;
    revokedAt: Date | null;
  }): AuthSession {
    return AuthSession.rehydrate({
      id: row.id,
      actorType: ActorTypeMapper.toDomain(row.actorType),
      actorId: row.actorId,
      deviceInfo: DeviceInfo.create({
        deviceId: row.deviceId ?? undefined,
        ipAddress: row.ipAddress ?? undefined,
        userAgent: row.userAgent ?? undefined,
      }),
      createdAt: row.createdAt,
      lastUsedAt: row.lastUsedAt,
      revokedAt: row.revokedAt ?? undefined,
    });
  }
}
