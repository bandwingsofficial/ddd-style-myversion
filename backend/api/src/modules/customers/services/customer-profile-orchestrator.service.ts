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
    return this.profileService.createProfile({
      customerId: params.customerId,
      fullName: params.fullName,
      email: params.email,
      avatarUrl: params.avatarUrl,
      gender: params.gender,
      dob: params.dob,
    });
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
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    gender?: string;
    dob?: Date;
  }): Promise<CustomerProfile> {
    return this.profileService.upsertProfile({
      customerId: params.customerId,
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
