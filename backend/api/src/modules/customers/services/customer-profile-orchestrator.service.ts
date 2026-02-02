import { Injectable } from '@nestjs/common';

import { CustomerProfile } from '../domain/customer-profile.model';
import { CustomerProfileService } from './customer-profile.service';

/* ================================================= */
/* ORCHESTRATOR                                     */
/* ================================================= */

@Injectable()
export class CustomerProfileOrchestratorService {
  constructor(
    private readonly profileService: CustomerProfileService,
  ) {}

  /* ================================================= */
  /* READ                                              */
  /* ================================================= */

  async getProfile(
    customerId: string,
  ): Promise<CustomerProfile | null> {
    return this.profileService.getProfile(customerId);
  }

  async getProfileOrThrow(
    customerId: string,
  ): Promise<CustomerProfile> {
    return this.profileService.getProfileOrThrow(customerId);
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
    return this.profileService.createProfile(params);
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
    return this.profileService.updateProfile(params);
  }

  /* ================================================= */
  /* UPSERT (recommended for frontend)                 */
  /* ================================================= */

  async upsertProfile(params: {
    customerId: string;
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    gender?: string;
    dob?: Date;
  }): Promise<CustomerProfile> {
    return this.profileService.upsertProfile(params);
  }

  /* ================================================= */
  /* DELETE                                            */
  /* ================================================= */

  async deleteProfile(customerId: string): Promise<void> {
    return this.profileService.deleteProfile(customerId);
  }
}
