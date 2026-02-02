import { SuperAdminProfile as PrismaSuperAdminProfile } from '@prisma/client';

import { SuperAdminProfile } from '../domain/models/super-admin-profile.model';

/**
 * SuperAdminProfileMapper
 * --------------------------------------------------
 * Maps:
 *   Prisma  ⇄  Domain
 *
 * Keep repository clean & domain pure
 */
export class SuperAdminProfileMapper {
  /* ================================================= */
  /* TO DOMAIN                                        */
  /* ================================================= */

  static toDomain(
    row: PrismaSuperAdminProfile,
  ): SuperAdminProfile {
    return SuperAdminProfile.rehydrate({
      id: row.id,
      superAdminId: row.superAdminId,

      fullName: row.fullName,
      avatarUrl: row.avatarUrl ?? undefined,
      title: row.title ?? undefined,

      phone: row.phone ?? undefined,
      notes: row.notes ?? undefined,

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  /* ================================================= */
  /* TO PRISMA (CREATE)                               */
  /* ================================================= */

  static toCreateInput(
    profile: SuperAdminProfile,
  ) {
    return {
      id: profile.id,
      superAdminId: profile.superAdminId,

      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl ?? null,
      title: profile.title ?? null,

      phone: profile.phone ?? null,
      notes: profile.notes ?? null,

      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  /* ================================================= */
  /* TO PRISMA (UPDATE)                               */
  /* ================================================= */

  static toUpdateInput(
    profile: SuperAdminProfile,
  ) {
    return {
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl ?? null,
      title: profile.title ?? null,

      phone: profile.phone ?? null,
      notes: profile.notes ?? null,

      updatedAt: profile.updatedAt,
    };
  }
}
