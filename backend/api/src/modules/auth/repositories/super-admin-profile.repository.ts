import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { SuperAdminProfile } from '../domain/models/super-admin-profile.model';
import { SuperAdminProfileMapper } from '../mappers/super-admin-profile.mapper';

/**
 * SuperAdminProfileRepository
 * --------------------------------------------------
 * ONLY:
 *   - persistence
 *   - mapping
 *
 * NEVER:
 *   - validation
 *   - business rules
 *   - orchestration
 */
@Injectable()
export class SuperAdminProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* READ                                             */
  /* ================================================= */

  async findBySuperAdminId(
    superAdminId: string,
    tx?: PrismaTransaction,
  ): Promise<SuperAdminProfile | null> {
    const row = await (tx ?? this.prisma).superAdminProfile.findUnique({
      where: { superAdminId },
    });

    return row
      ? SuperAdminProfileMapper.toDomain(row)
      : null;
  }

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<SuperAdminProfile | null> {
    const row = await (tx ?? this.prisma).superAdminProfile.findUnique({
      where: { id },
    });

    return row
      ? SuperAdminProfileMapper.toDomain(row)
      : null;
  }

  /* ================================================= */
  /* CREATE                                           */
  /* ================================================= */

  async create(
    profile: SuperAdminProfile,
    tx?: PrismaTransaction,
  ): Promise<SuperAdminProfile> {
    const client = tx ?? this.prisma;

    const row = await client.superAdminProfile.create({
      data: SuperAdminProfileMapper.toCreateInput(profile),
    });

    return SuperAdminProfileMapper.toDomain(row);
  }

  /* ================================================= */
  /* UPDATE                                           */
  /* ================================================= */

  async update(
    profile: SuperAdminProfile,
    tx?: PrismaTransaction,
  ): Promise<SuperAdminProfile> {
    const client = tx ?? this.prisma;

    const row = await client.superAdminProfile.update({
      where: { superAdminId: profile.superAdminId },
      data: SuperAdminProfileMapper.toUpdateInput(profile),
    });

    return SuperAdminProfileMapper.toDomain(row);
  }

  /* ================================================= */
  /* UPSERT (very useful for profile flows)            */
  /* ================================================= */

  async upsert(
    profile: SuperAdminProfile,
    tx?: PrismaTransaction,
  ): Promise<SuperAdminProfile> {
    const client = tx ?? this.prisma;

    const row = await client.superAdminProfile.upsert({
      where: { superAdminId: profile.superAdminId },

      create: SuperAdminProfileMapper.toCreateInput(profile),

      update: SuperAdminProfileMapper.toUpdateInput(profile),
    });

    return SuperAdminProfileMapper.toDomain(row);
  }

  /* ================================================= */
  /* DELETE                                           */
  /* ================================================= */

  async deleteBySuperAdminId(
    superAdminId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    await (tx ?? this.prisma).superAdminProfile.delete({
      where: { superAdminId },
    });
  }
}
