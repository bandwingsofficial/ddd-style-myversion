// src/modules/outlets/services/outlet-orchestrator.service.ts

import { Injectable } from '@nestjs/common';

import { OutletUserService } from './outlet-user.service';
import { OutletService } from './outlet.service';
import { OutletProductService } from './outlet-product.service';
import { OutletProfileService } from './outlet-profile.service';

import { Outlet } from '../domain/models/outlet.model';
import { OutletProfile } from '../domain/models/outlet-profile.model';

/**
 * Orchestrator = controller-facing layer
 * --------------------------------------------------
 * - Controllers talk ONLY to this class
 * - No domain logic
 * - No validation rules
 * - No data mutation
 * - Delegates to services
 */
@Injectable()
export class OutletOrchestratorService {
  constructor(
    private readonly outletUserService: OutletUserService,
    private readonly outletService: OutletService,
    private readonly outletProductService: OutletProductService,
    private readonly outletProfileService: OutletProfileService,
  ) {}

  /* ================================================= */
  /* OUTLET – READS                                    */
  /* ================================================= */

 async getOutletById(outletId: string): Promise<Outlet | null> {
  return this.outletService.getById(outletId);
}

  async getAllOutlets(): Promise<Outlet[]> {
  return this.outletService.getAllOutlets();
}

  /* ================================================= */
  /* ⭐ NEW – NEARBY OUTLETS (delegates only)           */
  /* ================================================= */

async getNearbyOutlets(
  lat: number,
  lng: number,
): Promise<{ outlet: Outlet; distanceKm: number }[]> {
  return this.outletService.getNearbyOutlets(lat, lng);
}
  /* ================================================= */
  /* OUTLET – CREATE / UPDATE / ENABLE / DISABLE        */
  /* ================================================= */

  async createOutlet(params: {
    outlet: Outlet;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletService.createOutlet(params);
  }

  async updateOutletDetails(params: {
    outletId: string;
    updates: {
      name?: string;
      branch?: string;
      address?: string;
      pincode?: string;
      latitude?: number;
      longitude?: number;
      deliveryRadiusKm?: number;
    };
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletService.updateDetails(params);
  }

  async disableOutlet(params: {
    outletId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletService.disableOutlet(params);
  }

  async enableOutlet(params: {
    outletId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletService.enableOutlet(params);
  }

  /* ================================================= */
  /* OUTLET – WORKING STATUS                            */
  /* ================================================= */

  async openOutlet(params: {
    outletId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletService.openOutlet(params);
  }

  async closeOutlet(params: {
    outletId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletService.closeOutlet(params);
  }

  async temporarilyCloseOutlet(params: {
    outletId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletService.temporarilyCloseOutlet(params);
  }

  /* ================================================= */
  /* OUTLET – CAMERA                                   */
  /* ================================================= */

  async turnOutletCameraOn(params: {
    outletId: string;
    streamUrl: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletService.turnCameraOn(params);
  }

  async turnOutletCameraOff(params: {
    outletId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletService.turnCameraOff(params);
  }

  /* ================================================= */
  /* OUTLET PRODUCT – READS                            */
  /* ================================================= */

  async getOutletProducts(outletId: string) {
    return this.outletProductService.getProducts(outletId);
  }

  async getAvailableOutletProducts(outletId: string) {
    return this.outletProductService.getAvailableProducts(outletId);
  }

  async getAvailableOutletProductsWithDetails(outletId: string) {
    return this.outletProductService.getAvailableProductsWithDetails(outletId);
  }

  /* ================================================= */
  /* OUTLET PRODUCT – ASSIGN / TOGGLE / PRICING        */
  /* ================================================= */

  async assignProductToOutlet(params: {
    outletId: string;
    productId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletProductService.assignProduct(params);
  }

  async enableOutletProduct(params: {
    outletId: string;
    productId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletProductService.enableProduct(params);
  }

  async disableOutletProduct(params: {
    outletId: string;
    productId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletProductService.disableProduct(params);
  }

  async updateOutletProductPricing(params: {
    outletId: string;
    productId: string;
    priceOverride?: number | null;
    discountOverride?: number | null;
    adminId: string;
  }) {
    return this.outletProductService.updatePricing(params);
  }

  async removeProductFromOutlet(params: {
    outletId: string;
    productId: string;
    adminId: string;
  }) {
    return this.outletProductService.removeProduct(params);
  }

  /* ================================================= */
  /* OUTLET USER – READS                               */
  /* ================================================= */

  async getOutletUserById(userId: string) {
    return this.outletUserService.getById(userId);
  }

  async getOutletUsersByOutlet(outletId: string) {
    return this.outletUserService.getByOutlet(outletId);
  }

  /* ================================================= */
  /* OUTLET USER – CREATE / UPDATE                     */
  /* ================================================= */

  async createOutletUser(params: {
    outletId: string;
    email: string;
    rawPassword: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletUserService.createUser(params);
  }

  async resetOutletUserPassword(params: {
    email: string;
    newRawPassword: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletUserService.resetPassword(params);
  }

  async disableOutletUser(params: {
    outletUserId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletUserService.disableUser(params);
  }

  async enableOutletUser(params: {
    outletUserId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.outletUserService.enableUser(params);
  }

  /* ================================================= */
  /* OUTLET PROFILE – READS                            */
  /* ================================================= */

  async getOutletProfile(
    outletId: string,
  ): Promise<OutletProfile | null> {
    return this.outletProfileService.getProfile(outletId);
  }

  async getOutletProfileOrThrow(
    outletId: string,
  ): Promise<OutletProfile> {
    return this.outletProfileService.getProfileOrThrow(outletId);
  }

  /* ================================================= */
  /* OUTLET PROFILE – CREATE / UPDATE / UPSERT / DELETE */
  /* ================================================= */

  async createOutletProfile(params: {
    outletId: string;

    logoUrl?: string;
    bannerUrl?: string;

    contactPhone?: string;
    contactEmail?: string;

    ownerName?: string;
    description?: string;

    gstNumber?: string;
    fssaiNumber?: string;
  }) {
    return this.outletProfileService.createProfile(params);
  }

  async updateOutletProfile(params: {
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
  }) {
    return this.outletProfileService.updateProfile(params);
  }

  async upsertOutletProfile(params: {
    outletId: string;

    logoUrl?: string;
    bannerUrl?: string;

    contactPhone?: string;
    contactEmail?: string;

    ownerName?: string;
    description?: string;

    gstNumber?: string;
    fssaiNumber?: string;
  }) {
    return this.outletProfileService.upsertProfile(params);
  }

  async deleteOutletProfile(outletId: string) {
    return this.outletProfileService.deleteProfile(outletId);
  }
}
