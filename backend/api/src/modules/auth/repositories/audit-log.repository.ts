// src/modules/auth/repositories/audit-log.repository.ts

import { Injectable } from '@nestjs/common';
import {
  Prisma,
  ActorType as PrismaActorType,
  AuditAction as PrismaAuditAction,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { ActorType } from '../domain/enums/actor-type.enum';
import { AuditAction } from '../domain/enums/audit-action.enum';

import { ActorTypeMapper } from '../mappers/actor-type.mapper';
import { AuditActionMapper } from '../mappers/audit-action.mapper';

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    params: {
      actorType: ActorType;
      actorId?: string;
      sessionId?: string;
      action: AuditAction;
      metadata?: unknown; // ✅ domain-safe
      ipAddress?: string;
      userAgent?: string;
    },
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    await client.auditLog.create({
      data: {
        actorType: ActorTypeMapper.toPrisma(params.actorType),
        actorId: params.actorId,
        sessionId: params.sessionId,
        action: AuditActionMapper.toPrisma(params.action),
        metadata: this.normalizeMetadata(params.metadata), // ✅ FIX
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  }

  async findByActor(
    actorType: ActorType,
    actorId: string,
    tx?: PrismaTransaction,
  ): Promise<
    readonly {
      id: string;
      actorType: PrismaActorType;
      actorId: string | null;
      sessionId: string | null;
      action: PrismaAuditAction;
      metadata: Prisma.JsonValue | null;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
    }[]
  > {
    const client = tx ?? this.prisma;

    return client.auditLog.findMany({
      where: {
        actorType: ActorTypeMapper.toPrisma(actorType),
        actorId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySession(
    sessionId: string,
    tx?: PrismaTransaction,
  ): Promise<
    readonly {
      id: string;
      actorType: PrismaActorType;
      actorId: string | null;
      sessionId: string | null;
      action: PrismaAuditAction;
      metadata: Prisma.JsonValue | null;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
    }[]
  > {
    const client = tx ?? this.prisma;

    return client.auditLog.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /* ---------------------------------------------- */
  /* INTERNAL HELPERS                                */
  /* ---------------------------------------------- */

  private normalizeMetadata(
    metadata?: unknown,
  ): Prisma.InputJsonValue | undefined {
    if (metadata === undefined) return undefined;

    // Ensures plain JSON (no prototypes, no class instances)
    return JSON.parse(JSON.stringify(metadata));
  }
}
