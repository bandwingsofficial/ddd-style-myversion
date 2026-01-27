// src/modules/customer/services/saved-address-orchestrator.service.ts

import { Injectable } from '@nestjs/common';

import { SavedAddressService } from './saved-address.service';
import { SavedAddress } from '../domain/models/saved-address.model';

@Injectable()
export class SavedAddressOrchestratorService {
  constructor(
    private readonly savedAddressService: SavedAddressService,
  ) {}

  /* ================================================= */
  /* SAVED ADDRESS – READS                             */
  /* ================================================= */

  async getSavedAddressById(params: {
    customerId: string;
    savedAddressId: string;
  }): Promise<SavedAddress> {
    return this.savedAddressService.getById(params);
  }

  async getAllSavedAddresses(params: {
    customerId: string;
  }): Promise<SavedAddress[]> {
    return this.savedAddressService.getAllByCustomer(
      params.customerId,
    );
  }

  /* ================================================= */
  /* ⭐ NEW – PRIMARY ADDRESS (MOST USED)               */
  /* ================================================= */

  async getPrimarySavedAddress(
    customerId: string,
  ): Promise<SavedAddress | null> {
    return this.savedAddressService.getPrimaryAddress(
      customerId,
    );
  }

  /* ================================================= */
  /* SAVED ADDRESS – CREATE / UPDATE                   */
  /* ================================================= */

  async createSavedAddress(params: {
    address: SavedAddress;
  }): Promise<SavedAddress> {
    return this.savedAddressService.createSavedAddress(
      params.address,
    );
  }

  async updateSavedAddress(params: {
    customerId: string;
    savedAddressId: string;
    label?: string;
    addressText?: string;
    latitude?: number | null;
    longitude?: number | null;
  }): Promise<SavedAddress> {
    return this.savedAddressService.updateSavedAddress(
      params,
    );
  }

  /* ================================================= */
  /* SAVED ADDRESS – DELETE                            */
  /* ================================================= */

  async deleteSavedAddress(params: {
    customerId: string;
    savedAddressId: string;
  }): Promise<{ id: string; deleted: true }> {
    return this.savedAddressService.deleteSavedAddress(
      params,
    );
  }
}
