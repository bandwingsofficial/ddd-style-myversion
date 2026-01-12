// src/modules/auth/repositories/super-admin.repository.ts

import { Injectable } from '@nestjs/common';
import { Prisma, SuperAdmin as PrismaSuperAdmin } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { SuperAdmin } from '../domain/models/super-admin.model';
import { InvariantViolationError } from '../../../common/errors';

type PrismaClientLike =
  | PrismaService
  | Prisma.TransactionClient;

@Injectable()
export class SuperAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ---------------------------------------------- */
  /* CREATE / READ                                  */
  /* ---------------------------------------------- */

  async create(
    params: {
      email: string;
      passwordHash: string;
      totpSecret: string;
    },
    tx?: PrismaTransaction,
  ): Promise<SuperAdmin> {
    const client = tx ?? this.prisma;

    const row = await client.superAdmin.create({
      data: {
        email: params.email,
        passwordHash: params.passwordHash,
        totpSecret: params.totpSecret,
        mfaEnabled: true,
        isActive: true,
      },
    });

    return this.toDomain(row);
  }

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<SuperAdmin | null> {
    const client = tx ?? this.prisma;

    const row = await client.superAdmin.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByEmail(
    email: string,
    tx?: PrismaTransaction,
  ): Promise<SuperAdmin | null> {
    const client = tx ?? this.prisma;

    const row = await client.superAdmin.findUnique({
      where: { email },
    });

    return row ? this.toDomain(row) : null;
  }

  /* ---------------------------------------------- */
  /* SECURITY / ACCOUNT MUTATIONS (STRICT)           */
  /* ---------------------------------------------- */

  async updatePassword(
    adminId: string,
    passwordHash: string,
    tx?: PrismaTransaction,
  ): Promise<SuperAdmin> {
    const client = tx ?? this.prisma;

    const result = await client.superAdmin.updateMany({
      where: { id: adminId },
      data: { passwordHash },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'SUPER_ADMIN_NOT_FOUND',
        'Super admin not found',
        { adminId },
      );
    }

    return this.findByIdOrFail(adminId, client);
  }

  async updateTotpSecret(
    adminId: string,
    totpSecret: string,
    tx?: PrismaTransaction,
  ): Promise<SuperAdmin> {
    const client = tx ?? this.prisma;

    const result = await client.superAdmin.updateMany({
      where: { id: adminId },
      data: { totpSecret },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'SUPER_ADMIN_NOT_FOUND',
        'Super admin not found',
        { adminId },
      );
    }

    return this.findByIdOrFail(adminId, client);
  }

  /**
   * Enable / disable MFA safely
   */
  async setMfaEnabled(
    adminId: string,
    enabled: boolean,
    tx?: PrismaTransaction,
  ): Promise<SuperAdmin> {
    const client = tx ?? this.prisma;

    const result = await client.superAdmin.updateMany({
      where: { id: adminId },
      data: {
        mfaEnabled: enabled,
        ...(enabled
          ? {}
          : {
              totpSecret: {
                set: null,
              } as Prisma.NullableStringFieldUpdateOperationsInput,
            }),
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'SUPER_ADMIN_NOT_FOUND',
        'Super admin not found',
        { adminId },
      );
    }

    return this.findByIdOrFail(adminId, client);
  }

  async deactivate(
    adminId: string,
    tx?: PrismaTransaction,
  ): Promise<SuperAdmin> {
    const client = tx ?? this.prisma;

    const result = await client.superAdmin.updateMany({
      where: { id: adminId, isActive: true },
      data: { isActive: false },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'SUPER_ADMIN_NOT_FOUND',
        'Super admin not found or already inactive',
        { adminId },
      );
    }

    return this.findByIdOrFail(adminId, client);
  }

  async activate(
    adminId: string,
    tx?: PrismaTransaction,
  ): Promise<SuperAdmin> {
    const client = tx ?? this.prisma;

    const result = await client.superAdmin.updateMany({
      where: { id: adminId, isActive: false },
      data: { isActive: true },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'SUPER_ADMIN_NOT_FOUND',
        'Super admin not found or already active',
        { adminId },
      );
    }

    return this.findByIdOrFail(adminId, client);
  }

  async incrementTokenVersion(
    adminId: string,
    tx?: PrismaTransaction,
  ): Promise<SuperAdmin> {
    const client = tx ?? this.prisma;

    const result = await client.superAdmin.updateMany({
      where: { id: adminId },
      data: {
        tokenVersion: { increment: 1 },
      },
    });

    if (result.count === 0) {
      throw new InvariantViolationError(
        'SUPER_ADMIN_NOT_FOUND',
        'Super admin not found',
        { adminId },
      );
    }

    return this.findByIdOrFail(adminId, client);
  }

  /* ---------------------------------------------- */
  /* INTERNAL HELPERS                               */
  /* ---------------------------------------------- */

  private async findByIdOrFail(
    adminId: string,
    client: PrismaClientLike,
  ): Promise<SuperAdmin> {
    const row = await client.superAdmin.findUnique({
      where: { id: adminId },
    });

    if (!row) {
      throw new InvariantViolationError(
        'SUPER_ADMIN_NOT_FOUND',
        'Super admin not found',
        { adminId },
      );
    }

    return this.toDomain(row);
  }

  /* ---------------------------------------------- */
  /* PRIVATE MAPPER                                 */
  /* ---------------------------------------------- */

  private toDomain(row: PrismaSuperAdmin): SuperAdmin {
    return SuperAdmin.rehydrate({
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      totpSecret: row.totpSecret ?? undefined,
      mfaEnabled: row.mfaEnabled,
      isActive: row.isActive,
      tokenVersion: row.tokenVersion,
      createdAt: row.createdAt,
    });
  }
}
