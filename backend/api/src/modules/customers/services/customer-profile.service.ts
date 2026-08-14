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
/* SERVICE                                           */
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

  /**
   * Authenticated profile payload including phone.
   *
   * Phone is stored on CustomerProfile after profile creation.
   *
   * During the soft-migration period, if an existing profile
   * somehow does not yet have a phone, Customer.phone is used
   * as a safe fallback.
   *
   * Phone ultimately originates from the verified Customer identity.
   */
  async getProfileResponse(customerId: string): Promise<{
    id: string | null;
    customerId: string;
    phone: string | null;
    fullName: string | null;
    email: string | null;
    avatarUrl: string | null;
    gender: string | null;
    dob: Date | null;
    referralCode: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  } | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        phone: true,
      },
    });

    if (!customer) {
      return null;
    }

    const profile = await this.profileRepo.findByCustomerId(customerId);

    return {
      id: profile?.id ?? null,
      customerId: customer.id,

      /*
       * Customer.phone is the safe fallback during migration.
       *
       * If the profile already contains a phone, use that.
       * Otherwise use the existing Customer.phone.
       */
      phone: profile?.phone ?? customer.phone,

      fullName: profile?.fullName ?? null,
      email: profile?.email ?? null,
      avatarUrl: profile?.avatarUrl ?? null,
      gender: profile?.gender ?? null,
      dob: profile?.dob ?? null,
      referralCode: profile?.referralCode ?? null,
      createdAt: profile?.createdAt ?? null,
      updatedAt: profile?.updatedAt ?? null,
    };
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
  /* ENSURE PROFILE                                    */
  /* ================================================= */

  /**
   * Ensures that an authenticated Customer has a CustomerProfile.
   *
   * IMPORTANT:
   *
   * Existing profile:
   * - Returned as-is
   * - No fields are changed
   * - No existing data is overwritten
   *
   * Missing profile:
   * - Customer is loaded
   * - Customer.phone is used
   * - A new profile is created
   * - Other profile fields remain empty/null
   *
   * Phone is NEVER accepted from frontend input here.
   */
  async ensureProfile(customerId: string): Promise<CustomerProfile> {
    /* ---------------------------------- */
    /* Check existing profile             */
    /* ---------------------------------- */

    const existing = await this.profileRepo.findByCustomerId(customerId);

    if (existing) {
      /*
       * Profile already exists.
       *
       * IMPORTANT:
       * Do not update anything here.
       */
      return existing;
    }

    /* ---------------------------------- */
    /* Get authenticated Customer         */
    /* ---------------------------------- */

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        phone: true,
      },
    });

    if (!customer) {
      throw new ValidationError(
        'PROFILE_INVALID_CUSTOMER',
        'Customer not found',
      );
    }

    /* ---------------------------------- */
    /* Create missing profile             */
    /* ---------------------------------- */

    return this.createProfile({
      customerId: customer.id,
      phone: customer.phone,
    });
  }

  /* ================================================= */
  /* CREATE                                            */
  /* ================================================= */

  async createProfile(params: {
    customerId: string;
    phone: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    gender?: string;
    dob?: Date;
  }): Promise<CustomerProfile> {
    /* ---------------------------------- */
    /* Prevent duplicate profile           */
    /* ---------------------------------- */

    const existing = await this.profileRepo.findByCustomerId(
      params.customerId,
    );

    if (existing) {
      throw new ValidationError(
        'PROFILE_ALREADY_EXISTS',
        'Profile already exists for this customer',
      );
    }

    /* ---------------------------------- */
    /* Create domain entity                */
    /* ---------------------------------- */

    const profile = CustomerProfile.createNew({
      id: randomUUID(),
      customerId: params.customerId,
      phone: params.phone,

      fullName: params.fullName,
      email: params.email,
      avatarUrl: this.normalizeImagePath(params.avatarUrl),

      gender: params.gender,
      dob: params.dob,
    });

    let created!: CustomerProfile;

    /* ---------------------------------- */
    /* Persist inside transaction          */
    /* ---------------------------------- */

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
    /*
     * IMPORTANT:
     *
     * Use ensureProfile instead of getProfileOrThrow.
     *
     * This allows an existing Customer without a CustomerProfile
     * to be silently migrated.
     *
     * Existing profile:
     *   -> returned untouched
     *
     * Missing profile:
     *   -> created with Customer.phone
     *   -> then the requested update is applied
     */
    const profile = await this.ensureProfile(params.customerId);

    const oldAvatar = profile.avatarUrl;

    /* ---------------------------------- */
    /* EMAIL OWNERSHIP CHECK              */
    /* ---------------------------------- */

    /*
     * Email is UNIQUE in CustomerProfile.
     *
     * Before updating, check whether another
     * customer's profile already owns this email.
     *
     * Same profile:
     *   -> allowed
     *
     * Different profile:
     *   -> reject safely
     *   -> no database update happens
     *   -> no existing customer data is changed
     */
    if (params.updates.email !== undefined) {
      const normalizedEmail = params.updates.email.trim().toLowerCase();

      if (normalizedEmail) {
        const existingEmailProfile =
          await this.profileRepo.findByEmail(normalizedEmail);

        if (
          existingEmailProfile &&
          existingEmailProfile.id !== profile.id
        ) {
          throw new ValidationError(
            'PROFILE_EMAIL_ALREADY_EXISTS',
            'This email address is already associated with another customer',
          );
        }
      }
    }

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

    /* ---------------------------------- */
    /* Persist update                      */
    /* ---------------------------------- */

    await this.prisma.$transaction(async (tx: PrismaTransaction) => {
      saved = await this.profileRepo.update(updated, tx);
    });

    /* ---------------------------------- */
    /* Delete old avatar safely            */
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
    phone: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    gender?: string;
    dob?: Date;
  }): Promise<CustomerProfile> {
    const existing = await this.profileRepo.findByCustomerId(
      params.customerId,
    );

    /* ---------------------------------- */
    /* Missing profile                     */
    /* ---------------------------------- */

    if (!existing) {
      return this.createProfile(params);
    }

    /* ---------------------------------- */
    /* Existing profile                    */
    /* ---------------------------------- */

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