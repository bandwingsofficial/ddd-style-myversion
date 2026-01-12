// src/modules/auth/repositories/outlet-user.repository.ts

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OutletUser } from '../domain/models/outlet-user.model';
import { InvariantViolationError } from '../../../common/errors';

type PrismaClientLike =
  | PrismaService
  | Prisma.TransactionClient;

@Injectable()
export class OutletUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ---------------------------------------------- */
  /* CREATE / READ                                  */
  /* ---------------------------------------------- */

  async create(
    params: {
      outletId: string;
      email: string;
      passwordHash: string;
    },
    tx?: PrismaTransaction,
  ): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    const row = await client.outletUser.create({
      data: {
        outletId: params.outletId,
        email: params.email,
        passwordHash: params.passwordHash,
      },
    });

    return this.toDomain(row);
  }

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<OutletUser | null> {
    const client = tx ?? this.prisma;

    const row = await client.outletUser.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByEmail(
    email: string,
    tx?: PrismaTransaction,
  ): Promise<OutletUser | null> {
    const client = tx ?? this.prisma;

    const row = await client.outletUser.findUnique({
      where: { email },
    });

    return row ? this.toDomain(row) : null;
  }

  /* ---------------------------------------------- */
  /* SECURITY / ACCOUNT STATE                       */
  /* ---------------------------------------------- */

  async incrementFailedAttempts(
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    const result = await client.outletUser.updateMany({
      where: {
        id: userId,
        lockedUntil: null,
      },
      data: {
        failedAttempts: { increment: 1 },
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'OUTLET_USER_NOT_FOUND',
        'Outlet user not found or already locked',
        { userId },
      );
    }

    return this.findByIdOrFail(userId, client);
  }

  /**
   * ✅ FIXED
   * Reset is idempotent and must NEVER fail
   */
  async resetFailedAttempts(
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    try {
      await client.outletUser.update({
        where: { id: userId },
        data: {
          failedAttempts: 0,
          lockedUntil: null,
        },
      });
    } catch {
      throw new InvariantViolationError(
        'OUTLET_USER_NOT_FOUND',
        'Outlet user not found',
        { userId },
      );
    }

    return this.findByIdOrFail(userId, client);
  }

  async lockUntil(
    userId: string,
    lockedUntil: Date,
    tx?: PrismaTransaction,
  ): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    const result = await client.outletUser.updateMany({
      where: {
        id: userId,
        lockedUntil: null,
      },
      data: {
        lockedUntil,
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'OUTLET_USER_NOT_FOUND',
        'Outlet user not found or already locked',
        { userId },
      );
    }

    return this.findByIdOrFail(userId, client);
  }

  async deactivate(
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    const result = await client.outletUser.updateMany({
      where: {
        id: userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'OUTLET_USER_NOT_FOUND',
        'Outlet user not found or already inactive',
        { userId },
      );
    }

    return this.findByIdOrFail(userId, client);
  }

  async activate(
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    const result = await client.outletUser.updateMany({
      where: {
        id: userId,
        isActive: false,
      },
      data: {
        isActive: true,
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'OUTLET_USER_NOT_FOUND',
        'Outlet user not found or already active',
        { userId },
      );
    }

    return this.findByIdOrFail(userId, client);
  }

  async incrementTokenVersion(
    userId: string,
    tx?: PrismaTransaction,
  ): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    const result = await client.outletUser.updateMany({
      where: { id: userId },
      data: {
        tokenVersion: { increment: 1 },
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'OUTLET_USER_NOT_FOUND',
        'Outlet user not found',
        { userId },
      );
    }

    return this.findByIdOrFail(userId, client);
  }

  /* ---------------------------------------------- */
  /* INTERNAL HELPERS                               */
  /* ---------------------------------------------- */

  private async findByIdOrFail(
    userId: string,
    client: PrismaClientLike,
  ): Promise<OutletUser> {
    const row = await client.outletUser.findUnique({
      where: { id: userId },
    });

    if (!row) {
      throw new InvariantViolationError(
        'OUTLET_USER_NOT_FOUND',
        'Outlet user not found',
        { userId },
      );
    }

    return this.toDomain(row);
  }

  /* ---------------------------------------------- */
  /* PRIVATE MAPPER                                 */
  /* ---------------------------------------------- */

  private toDomain(row: {
    id: string;
    outletId: string;
    email: string;
    passwordHash: string;
    isActive: boolean;
    failedAttempts: number;
    lockedUntil: Date | null;
    tokenVersion: number;
    createdAt: Date;
  }): OutletUser {
    return OutletUser.rehydrate({
      id: row.id,
      outletId: row.outletId,
      email: row.email,
      passwordHash: row.passwordHash,
      isActive: row.isActive,
      failedAttempts: row.failedAttempts,
      lockedUntil: row.lockedUntil ?? undefined,
      tokenVersion: row.tokenVersion,
      createdAt: row.createdAt,
    });
  }
}
