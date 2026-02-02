import { Injectable } from '@nestjs/common';

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
      id: crypto.randomUUID(),
      ...params,
    });

    let created!: CustomerProfile;

    await this.prisma.$transaction(async (tx) => {
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

    const updated = profile.updateDetails(params.updates);

    let saved!: CustomerProfile;

    await this.prisma.$transaction(async (tx) => {
      saved = await this.profileRepo.update(updated, tx);
    });

    return saved;
  }

  /* ================================================= */
  /* UPSERT (most useful for frontend forms)            */
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
      updates: params,
    });
  }

  /* ================================================= */
  /* DELETE                                            */
  /* ================================================= */

  async deleteProfile(customerId: string): Promise<void> {
    const existing = await this.profileRepo.findByCustomerId(customerId);

    if (!existing) {
      throw new ValidationError(
        'PROFILE_NOT_FOUND',
        'Profile does not exist',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await this.profileRepo.deleteByCustomerId(customerId, tx);
    });
  }
}
