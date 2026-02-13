import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { CustomerProfile } from '../domain/customer-profile.model';
import { CustomerProfileRepository } from '../repositories/customer-profile.repository';

import { ValidationError } from '../../../common/errors';

/* ================================================= */
/* SERVICE                                          */
/* ================================================= */

@Injectable()
export class CustomerProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileRepo: CustomerProfileRepository,
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

    if (!normalized.startsWith('images/customerprofile/avatar/')) {
      throw new ValidationError(
        'PROFILE_INVALID_IMAGE_PATH',
        'Image path must be under images/customerprofile/avatar/',
      );
    }

    return normalized;
  }

  /* ================================================= */
  /* READ                                              */
  /* ================================================= */

  async getProfile(customerId: string): Promise<CustomerProfile | null> {
    return this.profileRepo.findByCustomerId(customerId);
  }

  async getProfileOrThrow(customerId: string): Promise<CustomerProfile> {
    const profile = await this.profileRepo.findByCustomerId(customerId);

    if (!profile) {
      throw new ValidationError(
        'PROFILE_NOT_FOUND',
        'Customer profile not found',
      );
    }

    return profile;
  }

  /* ================================================= */
  /* CREATE                                            */
  /* ================================================= */

  async createProfile(params: {
    customerId: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    gender?: string;
    dob?: Date;
  }): Promise<CustomerProfile> {
    const existing = await this.profileRepo.findByCustomerId(
      params.customerId,
    );

    if (existing) {
      throw new ValidationError(
        'PROFILE_ALREADY_EXISTS',
        'Profile already exists for this customer',
      );
    }

    const profile = CustomerProfile.createNew({
      id: randomUUID(),
      customerId: params.customerId,
      fullName: params.fullName,
      email: params.email,
      avatarUrl: this.normalizeImagePath(params.avatarUrl),
      gender: params.gender,
      dob: params.dob,
    });

    let created!: CustomerProfile;

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
      created = await this.profileRepo.create(profile, tx);
    });

    return created;
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  async updateProfile(params: {
    customerId: string;
    updates: {
      fullName?: string;
      email?: string;
      avatarUrl?: string;
      gender?: string;
      dob?: Date;
    };
  }): Promise<CustomerProfile> {
    const profile = await this.getProfileOrThrow(params.customerId);

    const oldAvatar = profile.avatarUrl;

    /* ---------------------------------- */
    /* Update non-avatar fields           */
    /* ---------------------------------- */

    let updated = profile.updateDetails({
      fullName: params.updates.fullName,
      email: params.updates.email,
      gender: params.updates.gender,
      dob: params.updates.dob,
    });

    /* ---------------------------------- */
    /* Handle avatar separately (DDD)     */
    /* ---------------------------------- */

    if (params.updates.avatarUrl !== undefined) {
      const normalizedAvatar = this.normalizeImagePath(
        params.updates.avatarUrl,
      );

      updated = normalizedAvatar
        ? updated.changeAvatar(normalizedAvatar)
        : updated.clearAvatar();
    }

    let saved!: CustomerProfile;

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
      saved = await this.profileRepo.update(updated, tx);
    });

    /* ---------------------------------- */
    /* Delete old avatar safely           */
    /* ---------------------------------- */

    if (oldAvatar && oldAvatar !== saved.avatarUrl) {
      this.deleteImageSafe(oldAvatar);
    }

    return saved;
  }

  /* ================================================= */
  /* UPSERT                                            */
  /* ================================================= */

  async upsertProfile(params: {
    customerId: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    gender?: string;
    dob?: Date;
  }): Promise<CustomerProfile> {
    const existing = await this.profileRepo.findByCustomerId(
      params.customerId,
    );

    if (!existing) {
      return this.createProfile(params);
    }

    return this.updateProfile({
      customerId: params.customerId,
      updates: {
        fullName: params.fullName,
        email: params.email,
        avatarUrl: params.avatarUrl,
        gender: params.gender,
        dob: params.dob,
      },
    });
  }

  /* ================================================= */
  /* DELETE                                            */
  /* ================================================= */

  async deleteProfile(customerId: string): Promise<void> {
    const existing = await this.getProfileOrThrow(customerId);

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
      await this.profileRepo.deleteByCustomerId(customerId, tx);
    });

    /* ---------------------------------- */
    /* Delete stored avatar                */
    /* ---------------------------------- */

    if (existing.avatarUrl) {
      this.deleteImageSafe(existing.avatarUrl);
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
