import { Injectable } from '@nestjs/common';

import { CustomerProfile } from '../domain/customer-profile.model';
import { CustomerProfileService } from './customer-profile.service';

/* ================================================= */
/* ORCHESTRATOR                                     */
/* ================================================= */

@Injectable()
export class CustomerProfileOrchestratorService {
  constructor(private readonly profileService: CustomerProfileService) {}

  /* ================================================= */
  /* READ                                              */
  /* ================================================= */

  async getProfile(customerId: string) {
    return this.profileService.getProfileResponse(customerId);
  }

  async getProfileOrThrow(customerId: string): Promise<CustomerProfile> {
    return this.profileService.getProfileOrThrow(customerId);
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
    return this.profileService.createProfile({
      customerId: params.customerId,
      phone: params.phone,
      fullName: params.fullName,
      email: params.email,
      avatarUrl: params.avatarUrl,
      gender: params.gender,
      dob: params.dob,
    });
  }

  /* ================================================= */
  /* ENSURE PROFILE                                    */
  /* ================================================= */

  /**
   * Ensures that the customer has a profile.
   *
   * Existing profile:
   * - Returned as-is
   * - No data is changed
   *
   * Missing profile:
   * - Created using the Customer.phone
   */
  async ensureProfile(customerId: string): Promise<CustomerProfile> {
    return this.profileService.ensureProfile(customerId);
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
    return this.profileService.updateProfile({
      customerId: params.customerId,
      updates: {
        fullName: params.updates.fullName,
        email: params.updates.email,
        avatarUrl: params.updates.avatarUrl,
        gender: params.updates.gender,
        dob: params.updates.dob,
      },
    });
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
    return this.profileService.upsertProfile({
      customerId: params.customerId,
      phone: params.phone,
      fullName: params.fullName,
      email: params.email,
      avatarUrl: params.avatarUrl,
      gender: params.gender,
      dob: params.dob,
    });
  }

  /* ================================================= */
  /* DELETE                                            */
  /* ================================================= */

  async deleteProfile(customerId: string): Promise<void> {
    return this.profileService.deleteProfile(customerId);
  }
}