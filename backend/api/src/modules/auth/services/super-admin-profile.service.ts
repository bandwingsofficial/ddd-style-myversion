import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

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
 *  - file cleanup
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
  /* 🔒 IMAGE NORMALIZATION                           */
  /* ================================================= */

  private normalizeImagePath(
    imagePath?: string | null,
  ): string | undefined {
    if (!imagePath) return undefined;

    let normalized = imagePath.trim();

    normalized = normalized.replace(/^https?:\/\/[^/]+\//, '');

    if (normalized.startsWith('/')) {
      normalized = normalized.slice(1);
    }

    if (!normalized.startsWith('images/superadminprofile/avatar/')) {
      throw new ValidationError(
        'INVALID_AVATAR_PATH',
        'Avatar must be inside images/superadminprofile/avatar/',
      );
    }

    return normalized;
  }

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
      superAdminId: params.superAdminId,
      fullName: params.fullName,
      avatarUrl: this.normalizeImagePath(params.avatarUrl),
      title: params.title,
      phone: this.normalizePhone(params.phone),
      notes: params.notes,
    });

    let created!: SuperAdminProfile;

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
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

    const oldAvatar = existing.avatarUrl;

    /* ---------------------------------- */
    /* Update non-avatar fields           */
    /* ---------------------------------- */

    let updated = existing.updateDetails({
      fullName: params.updates.fullName,
      title: params.updates.title,
      phone: this.normalizePhone(params.updates.phone),
      notes: params.updates.notes,
    });

    /* ---------------------------------- */
    /* Avatar handling (DDD style)        */
    /* ---------------------------------- */

    if (params.updates.avatarUrl !== undefined) {
      const normalizedAvatar = this.normalizeImagePath(
        params.updates.avatarUrl,
      );

      updated = normalizedAvatar
        ? updated.changeAvatar(normalizedAvatar)
        : updated.clearAvatar();
    }

    let saved!: SuperAdminProfile;

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
      saved = await this.repo.update(updated, tx);
    });

    /* ---------------------------------- */
    /* Delete old avatar if replaced      */
    /* ---------------------------------- */

    if (oldAvatar && oldAvatar !== saved.avatarUrl) {
      this.deleteImageSafe(oldAvatar);
    }

    return saved;
  }

  /* ================================================= */
  /* UPSERT                                           */
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
        avatarUrl: this.normalizeImagePath(params.avatarUrl),
        title: params.title,
        phone: this.normalizePhone(params.phone),
        notes: params.notes,
      });
    } else {
      profile = await this.updateProfile({
        superAdminId: params.superAdminId,
        updates: {
          fullName: params.fullName,
          avatarUrl: params.avatarUrl,
          title: params.title,
          phone: params.phone,
          notes: params.notes,
        },
      });

      return profile;
    }

    let saved!: SuperAdminProfile;

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
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

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
      await this.repo.deleteBySuperAdminId(superAdminId, tx);
    });

    if (existing.avatarUrl) {
      this.deleteImageSafe(existing.avatarUrl);
    }
  }

  /* ================================================= */
  /* HELPERS                                          */
  /* ================================================= */

  private normalizePhone(phone?: string): string | undefined {
    if (!phone?.trim()) return undefined;

    const digits = phone.replace(/[^\d+]/g, '');

    if (digits.startsWith('+')) return digits;
    if (digits.startsWith('91')) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;

    return digits;
  }

  private deleteImageSafe(imagePath?: string): void {
    if (!imagePath) return;

    const appRoot =
      process.env.APP_ROOT ?? path.resolve(process.cwd(), '..', '..');

    const fullPath = path.join(appRoot, imagePath);

    fs.promises.unlink(fullPath).catch(() => {
      // silent fail
    });
  }
}
