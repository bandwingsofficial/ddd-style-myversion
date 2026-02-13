import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OutletProfile } from '../domain/models/outlet-profile.model';
import { OutletProfileRepository } from '../repositories/outlet-profile.repository';

import { ValidationError } from '../../../common/errors';

@Injectable()
export class OutletProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileRepo: OutletProfileRepository,
  ) {}

  /* ================================================= */
  /* 🔒 IMAGE PATH NORMALIZATION                       */
  /* ================================================= */

  private normalizeImagePath(
    imagePath?: string | null,
  ): string | null | undefined {
    if (!imagePath) return imagePath;

    let normalized = imagePath.trim();

    normalized = normalized.replace(/^https?:\/\/[^/]+\//, '');

    if (normalized.startsWith('/')) {
      normalized = normalized.slice(1);
    }

    if (
      !normalized.startsWith('images/outletprofile/avatar/') &&
      !normalized.startsWith('images/outletprofile/banner/')
    ) {
      throw new ValidationError(
        'OUTLET_PROFILE_INVALID_IMAGE_PATH',
        'Image path must be under images/outletprofile/',
      );
    }

    return normalized;
  }

  /* ================================================= */
  /* READ                                              */
  /* ================================================= */

  async getProfile(outletId: string): Promise<OutletProfile | null> {
    return this.profileRepo.findByOutletId(outletId);
  }

  async getProfileOrThrow(outletId: string): Promise<OutletProfile> {
    const profile = await this.profileRepo.findByOutletId(outletId);

    if (!profile) {
      throw new ValidationError(
        'OUTLET_PROFILE_NOT_FOUND',
        'Outlet profile not found',
      );
    }

    return profile;
  }

  /* ================================================= */
  /* CREATE                                            */
  /* ================================================= */

  async createProfile(params: {
    outletId: string;

    avatarUrl?: string;
    bannerUrl?: string;

    contactPhone?: string;
    contactEmail?: string;

    ownerName?: string;
    description?: string;

    gstNumber?: string;
    fssaiNumber?: string;
  }): Promise<OutletProfile> {
    const existing = await this.profileRepo.findByOutletId(params.outletId);

    if (existing) {
      throw new ValidationError(
        'OUTLET_PROFILE_EXISTS',
        'Profile already exists for this outlet',
      );
    }

    const profile = OutletProfile.createNew({
      id: crypto.randomUUID(),
      outletId: params.outletId,

      avatarUrl: this.normalizeImagePath(params.avatarUrl),
      bannerUrl: this.normalizeImagePath(params.bannerUrl),

      contactPhone: params.contactPhone,
      contactEmail: params.contactEmail,
      ownerName: params.ownerName,
      description: params.description,
      gstNumber: params.gstNumber,
      fssaiNumber: params.fssaiNumber,
    });

    let created!: OutletProfile;

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
      created = await this.profileRepo.create(profile, tx);
    });

    return created;
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  async updateProfile(params: {
    outletId: string;
    updates: {
      avatarUrl?: string;
      bannerUrl?: string;

      contactPhone?: string;
      contactEmail?: string;

      ownerName?: string;
      description?: string;

      gstNumber?: string;
      fssaiNumber?: string;
    };
  }): Promise<OutletProfile> {
    const profile = await this.getProfileOrThrow(params.outletId);

    const oldAvatar = profile.avatarUrl;
    const oldBanner = profile.bannerUrl;

    const updated = profile.updateDetails({
      avatarUrl: this.normalizeImagePath(params.updates.avatarUrl),
      bannerUrl: this.normalizeImagePath(params.updates.bannerUrl),

      contactPhone: params.updates.contactPhone,
      contactEmail: params.updates.contactEmail,
      ownerName: params.updates.ownerName,
      description: params.updates.description,
      gstNumber: params.updates.gstNumber,
      fssaiNumber: params.updates.fssaiNumber,
    });

    let saved!: OutletProfile;

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
      saved = await this.profileRepo.update(updated, tx);
    });

    /* ---------------------------------- */
    /* Delete replaced files safely       */
    /* ---------------------------------- */

    if (oldAvatar && oldAvatar !== saved.avatarUrl) {
      this.deleteImageSafe(oldAvatar);
    }

    if (oldBanner && oldBanner !== saved.bannerUrl) {
      this.deleteImageSafe(oldBanner);
    }

    return saved;
  }

  /* ================================================= */
/* UPSERT                                            */
/* ================================================= */

async upsertProfile(params: {
  outletId: string;

  avatarUrl?: string;
  bannerUrl?: string;

  contactPhone?: string;
  contactEmail?: string;

  ownerName?: string;
  description?: string;

  gstNumber?: string;
  fssaiNumber?: string;
}): Promise<OutletProfile> {
  const existing = await this.profileRepo.findByOutletId(
    params.outletId,
  );

  if (!existing) {
    return this.createProfile(params);
  }

  return this.updateProfile({
    outletId: params.outletId,
    updates: {
      avatarUrl: params.avatarUrl,
      bannerUrl: params.bannerUrl,
      contactPhone: params.contactPhone,
      contactEmail: params.contactEmail,
      ownerName: params.ownerName,
      description: params.description,
      gstNumber: params.gstNumber,
      fssaiNumber: params.fssaiNumber,
    },
  });
}

  /* ================================================= */
  /* DELETE                                            */
  /* ================================================= */

  async deleteProfile(outletId: string): Promise<void> {
    const existing = await this.getProfileOrThrow(outletId);

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
      await this.profileRepo.deleteByOutletId(outletId, tx);
    });

    /* ---------------------------------- */
    /* Delete stored images               */
    /* ---------------------------------- */

    if (existing.avatarUrl) {
      this.deleteImageSafe(existing.avatarUrl);
    }

    if (existing.bannerUrl) {
      this.deleteImageSafe(existing.bannerUrl);
    }
  }

  /* ================================================= */
  /* FILE HELPER                                       */
  /* ================================================= */

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
