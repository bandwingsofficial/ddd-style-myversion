import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OutletProfile } from '../domain/models/outlet-profile.model';
import { OutletProfileRepository } from '../repositories/outlet-profile.repository';

import { ValidationError } from '../../../common/errors';

/* ================================================= */
/* SERVICE                                          */
/* ================================================= */

@Injectable()
export class OutletProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileRepo: OutletProfileRepository,
  ) {}

  /* ================================================= */
  /* READ                                              */
  /* ================================================= */

  async getProfile(
    outletId: string,
  ): Promise<OutletProfile | null> {
    return this.profileRepo.findByOutletId(outletId);
  }

  async getProfileOrThrow(
    outletId: string,
  ): Promise<OutletProfile> {
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

    logoUrl?: string;
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

    if (existing) {
      throw new ValidationError(
        'OUTLET_PROFILE_EXISTS',
        'Profile already exists for this outlet',
      );
    }

    const profile = OutletProfile.createNew({
      id: crypto.randomUUID(),
      ...params,
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
      logoUrl?: string;
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

    const updated = profile.updateDetails(params.updates);

    let saved!: OutletProfile;

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
      saved = await this.profileRepo.update(updated, tx);
    });

    return saved;
  }

  /* ================================================= */
  /* UPSERT (most practical for admin forms)            */
  /* ================================================= */

  async upsertProfile(params: {
    outletId: string;

    logoUrl?: string;
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
      updates: params,
    });
  }

  /* ================================================= */
  /* DELETE                                            */
  /* ================================================= */

  async deleteProfile(outletId: string): Promise<void> {
    const existing = await this.profileRepo.findByOutletId(outletId);

    if (!existing) {
      throw new ValidationError(
        'OUTLET_PROFILE_NOT_FOUND',
        'Profile does not exist',
      );
    }

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
      await this.profileRepo.deleteByOutletId(outletId, tx);
    });
  }
}
