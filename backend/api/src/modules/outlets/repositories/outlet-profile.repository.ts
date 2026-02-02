import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OutletProfile } from '../domain/models/outlet-profile.model';
import { OutletProfileMapper } from '../mappers/outlet-profile.mapper';

/* ================================================= */
/* REPOSITORY                                       */
/* ================================================= */

@Injectable()
export class OutletProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* READ – SINGLE                                     */
  /* ================================================= */

  async findByOutletId(
    outletId: string,
    tx?: PrismaTransaction,
  ): Promise<OutletProfile | null> {
    const row = await (tx ?? this.prisma).outletProfile.findUnique({
      where: { outletId },
    });

    return row ? OutletProfileMapper.toDomain(row) : null;
  }

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<OutletProfile | null> {
    const row = await (tx ?? this.prisma).outletProfile.findUnique({
      where: { id },
    });

    return row ? OutletProfileMapper.toDomain(row) : null;
  }

  /* ================================================= */
  /* CREATE                                            */
  /* ================================================= */

  async create(
    profile: OutletProfile,
    tx?: PrismaTransaction,
  ): Promise<OutletProfile> {
    const client = tx ?? this.prisma;

    const row = await client.outletProfile.create({
      data:
        OutletProfileMapper.toCreateInput(
          profile,
        ) satisfies Prisma.OutletProfileUncheckedCreateInput,
    });

    return OutletProfileMapper.toDomain(row);
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  async update(
    profile: OutletProfile,
    tx?: PrismaTransaction,
  ): Promise<OutletProfile> {
    const client = tx ?? this.prisma;

    const row = await client.outletProfile.update({
      where: { outletId: profile.outletId },
      data: OutletProfileMapper.toUpdateInput(profile),
    });

    return OutletProfileMapper.toDomain(row);
  }

  /* ================================================= */
  /* UPSERT                                            */
  /* ================================================= */

  async upsert(
    profile: OutletProfile,
    tx?: PrismaTransaction,
  ): Promise<OutletProfile> {
    const client = tx ?? this.prisma;

    const row = await client.outletProfile.upsert({
      where: { outletId: profile.outletId },
      create:
        OutletProfileMapper.toCreateInput(
          profile,
        ) satisfies Prisma.OutletProfileUncheckedCreateInput,
      update: OutletProfileMapper.toUpdateInput(profile),
    });

    return OutletProfileMapper.toDomain(row);
  }

  /* ================================================= */
  /* DELETE                                            */
  /* ================================================= */

  async deleteByOutletId(
    outletId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    await (tx ?? this.prisma).outletProfile.delete({
      where: { outletId },
    });
  }
}
