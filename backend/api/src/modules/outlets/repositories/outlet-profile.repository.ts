import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OutletProfile } from '../domain/models/outlet-profile.model';

/* ================================================= */
/* REPOSITORY                                       */
/* ================================================= */

@Injectable()
export class OutletProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* READ – SINGLE                                    */
  /* ================================================= */

  async findByOutletId(
    outletId: string,
    tx?: PrismaTransaction,
  ): Promise<OutletProfile | null> {
    const row = await (tx ?? this.prisma).outletProfile.findUnique({
      where: { outletId },
    });

    return row ? this.toDomain(row) : null;
  }

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<OutletProfile | null> {
    const row = await (tx ?? this.prisma).outletProfile.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
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
      data: {
        id: profile.id,
        outletId: profile.outletId,

        avatarUrl: profile.avatarUrl,
        bannerUrl: profile.bannerUrl,

        contactPhone: profile.contactPhone,
        contactEmail: profile.contactEmail,

        ownerName: profile.ownerName,
        description: profile.description,

        gstNumber: profile.gstNumber,
        fssaiNumber: profile.fssaiNumber,

        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      } satisfies Prisma.OutletProfileUncheckedCreateInput,
    });

    return this.toDomain(row);
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
      data: {
        avatarUrl: profile.avatarUrl,
        bannerUrl: profile.bannerUrl,

        contactPhone: profile.contactPhone,
        contactEmail: profile.contactEmail,

        ownerName: profile.ownerName,
        description: profile.description,

        gstNumber: profile.gstNumber,
        fssaiNumber: profile.fssaiNumber,

        updatedAt: profile.updatedAt,
      } satisfies Prisma.OutletProfileUncheckedUpdateInput,
    });

    return this.toDomain(row);
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
      create: {
        id: profile.id,
        outletId: profile.outletId,

        avatarUrl: profile.avatarUrl,
        bannerUrl: profile.bannerUrl,

        contactPhone: profile.contactPhone,
        contactEmail: profile.contactEmail,

        ownerName: profile.ownerName,
        description: profile.description,

        gstNumber: profile.gstNumber,
        fssaiNumber: profile.fssaiNumber,

        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      } satisfies Prisma.OutletProfileUncheckedCreateInput,
      update: {
        avatarUrl: profile.avatarUrl,
        bannerUrl: profile.bannerUrl,

        contactPhone: profile.contactPhone,
        contactEmail: profile.contactEmail,

        ownerName: profile.ownerName,
        description: profile.description,

        gstNumber: profile.gstNumber,
        fssaiNumber: profile.fssaiNumber,

        updatedAt: profile.updatedAt,
      } satisfies Prisma.OutletProfileUncheckedUpdateInput,
    });

    return this.toDomain(row);
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

  /* ================================================= */
  /* PRIVATE MAPPER                                   */
  /* ================================================= */

  private toDomain(row: {
    id: string;
    outletId: string;

    avatarUrl: string | null;
    bannerUrl: string | null;

    contactPhone: string | null;
    contactEmail: string | null;

    ownerName: string | null;
    description: string | null;

    gstNumber: string | null;
    fssaiNumber: string | null;

    createdAt: Date;
    updatedAt: Date;
  }): OutletProfile {
    return OutletProfile.rehydrate({
      id: row.id,
      outletId: row.outletId,

      avatarUrl: row.avatarUrl ?? undefined,
      bannerUrl: row.bannerUrl ?? undefined,

      contactPhone: row.contactPhone ?? undefined,
      contactEmail: row.contactEmail ?? undefined,

      ownerName: row.ownerName ?? undefined,
      description: row.description ?? undefined,

      gstNumber: row.gstNumber ?? undefined,
      fssaiNumber: row.fssaiNumber ?? undefined,

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
