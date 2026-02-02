import { OutletProfile as PrismaOutletProfile } from '@prisma/client';

import { OutletProfile } from '../domain/models/outlet-profile.model';

/* ================================================= */
/* MAPPER                                           */
/* ================================================= */

export class OutletProfileMapper {
  /* ================================================= */
  /* Prisma → Domain                                  */
  /* ================================================= */

  static toDomain(row: PrismaOutletProfile): OutletProfile {
    return OutletProfile.rehydrate({
      id: row.id,
      outletId: row.outletId,

      logoUrl: row.logoUrl ?? undefined,
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

  /* ================================================= */
  /* Domain → Prisma (create)                          */
  /* ================================================= */

  static toCreateInput(
    profile: OutletProfile,
  ): PrismaOutletProfile {
    return {
      id: profile.id,
      outletId: profile.outletId,

      logoUrl: profile.logoUrl ?? null,
      bannerUrl: profile.bannerUrl ?? null,

      contactPhone: profile.contactPhone ?? null,
      contactEmail: profile.contactEmail ?? null,

      ownerName: profile.ownerName ?? null,
      description: profile.description ?? null,

      gstNumber: profile.gstNumber ?? null,
      fssaiNumber: profile.fssaiNumber ?? null,

      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    } as PrismaOutletProfile;
  }

  /* ================================================= */
  /* Domain → Prisma (update)                          */
  /* ================================================= */

  static toUpdateInput(profile: OutletProfile) {
    return {
      logoUrl: profile.logoUrl ?? null,
      bannerUrl: profile.bannerUrl ?? null,

      contactPhone: profile.contactPhone ?? null,
      contactEmail: profile.contactEmail ?? null,

      ownerName: profile.ownerName ?? null,
      description: profile.description ?? null,

      gstNumber: profile.gstNumber ?? null,
      fssaiNumber: profile.fssaiNumber ?? null,

      updatedAt: profile.updatedAt,
    };
  }
}
