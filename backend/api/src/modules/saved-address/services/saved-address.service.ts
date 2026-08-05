// src/modules/customer/services/saved-address.service.ts

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { SavedAddress } from '../domain/models/saved-address.model';
import { SavedAddressRepository } from '../repositories/saved-address.repository';

import { ValidationError } from '../../../common/errors';
import { OutletResolutionService } from '../../outlets/services/outlet-resolution.service';

/* 🔥 EVENTS */
import { SavedAddressEventsService } from '../events/saved-address-events.service';
import { SavedAddressType } from '../domain/enums/saved-address-type.enum';

export interface AddressOutletResolution {
  resolvedOutletId: string | null;
  resolvedOutletName: string | null;
  serviceable: boolean;
}

@Injectable()
export class SavedAddressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly savedAddressRepo: SavedAddressRepository,
    private readonly savedAddressEvents: SavedAddressEventsService,
    private readonly outletResolution: OutletResolutionService,
  ) {}

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  async getById(
    params: {
      customerId: string;
      savedAddressId: string;
    },
    tx?: PrismaTransaction,
  ): Promise<SavedAddress> {
    const address = await this.savedAddressRepo.findById(
      params.savedAddressId,
      params.customerId,
      tx,
    );

    if (!address) {
      throw new ValidationError(
        'SAVED_ADDRESS_NOT_FOUND',
        'Saved address not found',
      );
    }

    return this.ensureAddressOutletResolved(address);
  }

  async getAllByCustomer(customerId: string): Promise<SavedAddress[]> {
    const addresses = await this.savedAddressRepo.findAllByCustomer(customerId);

    return Promise.all(
      addresses.map((address) => this.ensureAddressOutletResolved(address)),
    );
  }

  private async resolveOutletForCoordinates(
    latitude?: number | null,
    longitude?: number | null,
  ): Promise<AddressOutletResolution> {
    if (latitude == null || longitude == null) {
      return {
        resolvedOutletId: null,
        resolvedOutletName: null,
        serviceable: false,
      };
    }

    const resolution = await this.outletResolution.resolveForCoordinates(
      latitude,
      longitude,
    );

    if (resolution.status === 'NO_SERVICE' || !resolution.resolvedOutlet) {
      return {
        resolvedOutletId: null,
        resolvedOutletName: null,
        serviceable: false,
      };
    }

    return {
      resolvedOutletId: resolution.resolvedOutlet.outletId,
      resolvedOutletName: resolution.resolvedOutlet.outletName,
      serviceable: true,
    };
  }

  private async ensureAddressOutletResolved(
    address: SavedAddress,
  ): Promise<SavedAddress> {
    const needsResolution =
      address.latitude != null &&
      address.longitude != null &&
      (!address.resolvedOutletId || !address.serviceable);

    if (!needsResolution) {
      return address;
    }

    const resolution = await this.resolveOutletForCoordinates(
      address.latitude,
      address.longitude,
    );

    if (
      resolution.resolvedOutletId === address.resolvedOutletId &&
      resolution.serviceable === address.serviceable &&
      resolution.resolvedOutletName === address.resolvedOutletName
    ) {
      return address;
    }

    const updated = address.updateDetails({
      resolvedOutletId: resolution.resolvedOutletId,
      resolvedOutletName: resolution.resolvedOutletName,
      serviceable: resolution.serviceable,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.savedAddressRepo.save(updated, tx);
    });

    return updated;
  }

  /* ================================================= */
  /* PRIMARY                                           */
  /* ================================================= */

  async getPrimaryAddress(customerId: string): Promise<SavedAddress | null> {
    const addresses = await this.savedAddressRepo.findAllByCustomer(customerId);

    const primary = addresses.find((a) => a.isActive()) ?? null;
    return primary ? this.ensureAddressOutletResolved(primary) : null;
  }

  /* ================================================= */
  /* CREATE (RESTORE OR CREATE)                        */
  /* ================================================= */

  async createSavedAddress(address: SavedAddress): Promise<SavedAddress> {
    const resolution = await this.resolveOutletForCoordinates(
      address.latitude,
      address.longitude,
    );

    const addressWithOutlet = SavedAddress.createNew({
      id: address.id,
      customerId: address.customerId,
      type: address.type,
      label: address.label,
      addressText: address.addressText,
      houseNumber: address.houseNumber ?? undefined,
      street: address.street ?? undefined,
      landmark: address.landmark ?? undefined,
      pincode: address.pincode ?? undefined,
      latitude: address.latitude ?? undefined,
      longitude: address.longitude ?? undefined,
      resolvedOutletId: resolution.resolvedOutletId,
      resolvedOutletName: resolution.resolvedOutletName,
      serviceable: resolution.serviceable,
      now: address.createdAt,
    });

    let result!: SavedAddress;

    await this.prisma.$transaction(async (tx) => {
      if (
        addressWithOutlet.type === SavedAddressType.HOME ||
        addressWithOutlet.type === SavedAddressType.WORK
      ) {
        const active = await this.savedAddressRepo.findActiveByCustomerAndType(
          addressWithOutlet.customerId,
          addressWithOutlet.type,
          tx,
        );

        if (active) {
          throw new ValidationError(
            'SAVED_ADDRESS_TYPE_ALREADY_EXISTS',
            `Active ${addressWithOutlet.type} address already exists`,
          );
        }
      }

      if (
        addressWithOutlet.type === SavedAddressType.HOME ||
        addressWithOutlet.type === SavedAddressType.WORK
      ) {
        const deleted =
          await this.savedAddressRepo.findDeletedByCustomerAndType(
            addressWithOutlet.customerId,
            addressWithOutlet.type,
            tx,
          );

        if (deleted) {
          const restored = deleted.restore().updateDetails({
            label: addressWithOutlet.label,
            addressText: addressWithOutlet.addressText,
            houseNumber: addressWithOutlet.houseNumber,
            street: addressWithOutlet.street,
            landmark: addressWithOutlet.landmark,
            pincode: addressWithOutlet.pincode,
            latitude: addressWithOutlet.latitude,
            longitude: addressWithOutlet.longitude,
            resolvedOutletId: resolution.resolvedOutletId,
            resolvedOutletName: resolution.resolvedOutletName,
            serviceable: resolution.serviceable,
          });

          result = await this.savedAddressRepo.save(restored, tx);
          return;
        }
      }

      result = await this.savedAddressRepo.create(addressWithOutlet, tx);
    });

    this.savedAddressEvents.emitSavedAddressCreated({
      savedAddressId: result.id,
      customerId: result.customerId,
    });

    return result;
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  async updateSavedAddress(params: {
    customerId: string;
    savedAddressId: string;
    label?: string;
    addressText?: string;
    houseNumber?: string | null;
    street?: string | null;
    landmark?: string | null;
    pincode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }): Promise<SavedAddress> {
    const address = await this.savedAddressRepo.findById(
      params.savedAddressId,
      params.customerId,
    );

    if (!address) {
      throw new ValidationError(
        'SAVED_ADDRESS_NOT_FOUND',
        'Saved address not found',
      );
    }

    const nextLatitude =
      params.latitude !== undefined ? params.latitude : address.latitude;
    const nextLongitude =
      params.longitude !== undefined ? params.longitude : address.longitude;

    const resolution = await this.resolveOutletForCoordinates(
      nextLatitude,
      nextLongitude,
    );

    const updated = address.updateDetails({
      ...(params.label !== undefined && { label: params.label }),
      ...(params.addressText !== undefined && {
        addressText: params.addressText,
      }),
      ...(params.houseNumber !== undefined && {
        houseNumber: params.houseNumber,
      }),
      ...(params.street !== undefined && { street: params.street }),
      ...(params.landmark !== undefined && { landmark: params.landmark }),
      ...(params.pincode !== undefined && { pincode: params.pincode }),
      ...(params.latitude !== undefined && {
        latitude: params.latitude,
      }),
      ...(params.longitude !== undefined && {
        longitude: params.longitude,
      }),
      resolvedOutletId: resolution.resolvedOutletId,
      resolvedOutletName: resolution.resolvedOutletName,
      serviceable: resolution.serviceable,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.savedAddressRepo.save(updated, tx);
    });

    this.savedAddressEvents.emitSavedAddressUpdated({
      savedAddressId: updated.id,
      customerId: updated.customerId,
      label: updated.label,
      addressText: updated.addressText,
    });

    return updated;
  }

  /* ================================================= */
  /* DELETE (SOFT DELETE)                              */
  /* ================================================= */

  async deleteSavedAddress(params: {
    customerId: string;
    savedAddressId: string;
  }): Promise<{ id: string; deleted: true }> {
    const address = await this.savedAddressRepo.findById(
      params.savedAddressId,
      params.customerId,
    );

    if (!address) {
      throw new ValidationError(
        'SAVED_ADDRESS_NOT_FOUND',
        'Saved address not found',
      );
    }

    if (!address.isActive()) {
      return { id: address.id, deleted: true };
    }

    const deleted = address.softDelete();

    await this.prisma.$transaction(async (tx) => {
      await this.savedAddressRepo.softDelete(deleted, tx);
    });

    this.savedAddressEvents.emitSavedAddressDeleted({
      savedAddressId: deleted.id,
      customerId: deleted.customerId,
    });

    return { id: deleted.id, deleted: true };
  }
}
