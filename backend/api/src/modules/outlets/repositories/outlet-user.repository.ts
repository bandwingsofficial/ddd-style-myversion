// src/modules/outlets/repositories/outlet-user.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OutletUser } from '../domain/models/outlet-user.model';

@Injectable()
export class OutletUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

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
      where: { email: email.trim().toLowerCase() },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByOutlet(
    outletId: string,
    tx?: PrismaTransaction,
  ): Promise<OutletUser[]> {
    const client = tx ?? this.prisma;

    const rows = await client.outletUser.findMany({
      where: { outletId },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) => this.toDomain(row));
  }

  /* ================================================= */
  /* WRITES                                            */
  /* ================================================= */

  async create(
    user: OutletUser,
    tx?: PrismaTransaction,
  ): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    const row = await client.outletUser.create({
      data: {
        id: user.id,
        outletId: user.outletId,
        email: user.email,
        passwordHash: user.passwordHash,
        isActive: user.isActive,
        failedAttempts: user.failedAttempts,
        lockedUntil: user.lockedUntil,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /**
   * Used by:
   * - reset password
   * - login lock/unlock
   */
  async updatePassword(
    user: OutletUser,
    tx?: PrismaTransaction,
  ): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    const row = await client.outletUser.update({
      where: { id: user.id },
      data: {
        passwordHash: user.passwordHash,
        failedAttempts: user.failedAttempts,
        lockedUntil: user.lockedUntil,
        updatedAt: user.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /**
   * Used by:
   * - disable user (soft delete)
   * - enable user
   */
  async updateStatus(
    user: OutletUser,
    tx?: PrismaTransaction,
  ): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    const row = await client.outletUser.update({
      where: { id: user.id },
      data: {
        isActive: user.isActive,
        failedAttempts: user.failedAttempts,
        lockedUntil: user.lockedUntil,
        updatedAt: user.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* PRIVATE MAPPER                                    */
  /* ================================================= */

  private toDomain(row: {
    id: string;
    outletId: string;
    email: string;
    passwordHash: string;
    isActive: boolean;
    failedAttempts: number;
    lockedUntil: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): OutletUser {
    return OutletUser.rehydrate({
      id: row.id,
      outletId: row.outletId,
      email: row.email,
      passwordHash: row.passwordHash,
      isActive: row.isActive,
      failedAttempts: row.failedAttempts,
      lockedUntil: row.lockedUntil,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
