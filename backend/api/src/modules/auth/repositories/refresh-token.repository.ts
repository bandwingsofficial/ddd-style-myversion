// src/modules/auth/repositories/refresh-token.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { RefreshToken } from '../domain/models/refresh-token.model';
import { TokenHash } from '../domain/value-objects/token-hash.vo';
import { InvariantViolationError } from '../../../common/errors';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ---------------------------------------------- */
  /* CREATE                                         */
  /* ---------------------------------------------- */

  async create(
    params: {
      sessionId: string;
      tokenHash: TokenHash;
      expiresAt: Date;
    },
    tx?: PrismaTransaction,
  ): Promise<RefreshToken> {
    const client = tx ?? this.prisma;

    const row = await client.refreshToken.create({
      data: {
        sessionId: params.sessionId,
        tokenHash: params.tokenHash.getRaw(),
        expiresAt: params.expiresAt,
      },
    });

    return this.toDomain(row);
  }

  /* ---------------------------------------------- */
  /* READ                                           */
  /* ---------------------------------------------- */

  async findByTokenHash(
    tokenHash: TokenHash,
    tx?: PrismaTransaction,
  ): Promise<RefreshToken | null> {
    const client = tx ?? this.prisma;

    const row = await client.refreshToken.findFirst({
      where: { tokenHash: tokenHash.getRaw() },
      orderBy: { createdAt: 'desc' },
    });

    return row ? this.toDomain(row) : null;
  }

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<RefreshToken | null> {
    const client = tx ?? this.prisma;

    const row = await client.refreshToken.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  /* ---------------------------------------------- */
  /* SECURITY MUTATIONS (STRICT)                     */
  /* ---------------------------------------------- */

  /**
   * Rotate token safely (STRICT).
   * Fails if token is:
   * - already rotated
   * - expired
   * - missing
   */
  async markAsRotated(
    tokenId: string,
    replacedById: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    const result = await client.refreshToken.updateMany({
      where: {
        id: tokenId,
        rotatedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        rotatedAt: new Date(),
        replacedById,
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'REFRESH_TOKEN_INVALID',
        'Refresh token is invalid, expired, or already rotated',
        { tokenId },
      );
    }
  }

  async revokeBySessionId(
    sessionId: string,
    tx?: PrismaTransaction,
  ): Promise<number> {
    const client = tx ?? this.prisma;

    const result = await client.refreshToken.deleteMany({
      where: { sessionId },
    });

    return result.count;
  }

  async deleteExpired(
    tx?: PrismaTransaction,
  ): Promise<number> {
    const client = tx ?? this.prisma;

    const result = await client.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return result.count;
  }

  /* ---------------------------------------------- */
  /* PRIVATE MAPPER                                 */
  /* ---------------------------------------------- */

  private toDomain(row: {
    id: string;
    sessionId: string;
    tokenHash: string;
    createdAt: Date;
    expiresAt: Date;
    rotatedAt: Date | null;
    replacedById: string | null;
  }): RefreshToken {
    return RefreshToken.rehydrate({
      id: row.id,
      sessionId: row.sessionId,
      tokenHash: TokenHash.fromHash(row.tokenHash),
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      rotatedAt: row.rotatedAt ?? undefined,
      replacedById: row.replacedById ?? undefined,
    });
  }
}
