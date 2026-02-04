import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { ValidationError } from '../../../common/errors';

import { SuperAdminProfile } from '../domain/models/super-admin-profile.model';
import { SuperAdminProfileRepository } from '../repositories/super-admin-profile.repository';

/**
 * SuperAdminProfileService
 * --------------------------------------------------
 * Owns:
 *  - business rules
 *  - validation
 *  - transactions
 *
 * NEVER:
 *  - controller logic
 *  - mapping logic
 */
@Injectable()
export class SuperAdminProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: SuperAdminProfileRepository,
  ) {}

  /* ================================================= */
  /* READ                                             */
  /* ================================================= */

  async getProfile(
    superAdminId: string,
  ): Promise<SuperAdminProfile | null> {
    return this.repo.findBySuperAdminId(superAdminId);
  }

  /* ================================================= */
  /* CREATE                                           */
  /* ================================================= */

  async createProfile(params: {
    superAdminId: string;
    fullName: string;
    avatarUrl?: string;
    title?: string;
    phone?: string;
    notes?: string;
  }): Promise<SuperAdminProfile> {
    const existing = await this.repo.findBySuperAdminId(
      params.superAdminId,
    );

    if (existing) {
      throw new ValidationError(
        'PROFILE_ALREADY_EXISTS',
        'Super admin profile already exists',
      );
    }

    const profile = SuperAdminProfile.createNew({
      id: randomUUID(),
      ...params,
      phone: this.normalizePhone(params.phone),
    });

    let created!: SuperAdminProfile;

    await this.prisma.$transaction(async (tx) => {
      created = await this.repo.create(profile, tx);
    });

    return created;
  }

  /* ================================================= */
  /* UPDATE                                           */
  /* ================================================= */

  async updateProfile(params: {
    superAdminId: string;
    updates: {
      fullName?: string;
      avatarUrl?: string;
      title?: string;
      phone?: string;
      notes?: string;
    };
  }): Promise<SuperAdminProfile> {
    const existing = await this.repo.findBySuperAdminId(
      params.superAdminId,
    );

    if (!existing) {
      throw new ValidationError(
        'PROFILE_NOT_FOUND',
        'Profile does not exist',
      );
    }

    const updated = existing.update({
  ...params.updates,
  phone: this.normalizePhone(params.updates.phone),
});

    let saved!: SuperAdminProfile;

    await this.prisma.$transaction(async (tx) => {
      saved = await this.repo.update(updated, tx);
    });

    return saved;
  }

  /* ================================================= */
  /* UPSERT (🔥 recommended for profile flows)         */
  /* ================================================= */

  async upsertProfile(params: {
    superAdminId: string;
    fullName?: string;
    avatarUrl?: string;
    title?: string;
    phone?: string;
    notes?: string;
  }): Promise<SuperAdminProfile> {
    const existing = await this.repo.findBySuperAdminId(
      params.superAdminId,
    );

    let profile: SuperAdminProfile;

    if (!existing) {
      profile = SuperAdminProfile.createNew({
        id: randomUUID(),
        superAdminId: params.superAdminId,
        fullName: params.fullName ?? 'Super Admin',
        avatarUrl: params.avatarUrl,
        title: params.title,
        phone: this.normalizePhone(params.phone),
        notes: params.notes,
      });
    } else {
      profile = existing.update({
  ...params,
  phone: this.normalizePhone(params.phone),
});
    }

    let saved!: SuperAdminProfile;

    await this.prisma.$transaction(async (tx) => {
      saved = await this.repo.upsert(profile, tx);
    });

    return saved;
  }

  /* ================================================= */
  /* DELETE                                           */
  /* ================================================= */

  async deleteProfile(
    superAdminId: string,
  ): Promise<void> {
    const existing = await this.repo.findBySuperAdminId(
      superAdminId,
    );

    if (!existing) return;

    await this.prisma.$transaction(async (tx) => {
      await this.repo.deleteBySuperAdminId(superAdminId, tx);
    });
  }

private normalizePhone(phone?: string): string | undefined {
  if (!phone?.trim()) return undefined;

  const digits = phone.replace(/[^\d+]/g, '');

  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('91')) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;

  return digits;
}

}
