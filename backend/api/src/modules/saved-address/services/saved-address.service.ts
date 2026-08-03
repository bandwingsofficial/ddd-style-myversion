// src/modules/customer/services/saved-address.service.ts

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { SavedAddress } from '../domain/models/saved-address.model';
import { SavedAddressRepository } from '../repositories/saved-address.repository';

import { ValidationError } from '../../../common/errors';

/* 🔥 EVENTS */
import { SavedAddressEventsService } from '../events/saved-address-events.service';
import { SavedAddressType } from '../domain/enums/saved-address-type.enum';
import { OutletOrchestratorService } from '../../outlets/services/outlet-orchestrator.service';

@Injectable()
export class SavedAddressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly savedAddressRepo: SavedAddressRepository,
    private readonly savedAddressEvents: SavedAddressEventsService,
    private readonly outletOrchestrator: OutletOrchestratorService,
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

    return address;
  }

  async getAllByCustomer(customerId: string): Promise<SavedAddress[]> {
    return this.savedAddressRepo.findAllByCustomer(customerId);
  }

  private async resolveOutletIdForCoordinates(
    latitude?: number | null,
    longitude?: number | null,
  ): Promise<string | null> {
    if (latitude == null || longitude == null) {
      return null;
    }

    const nearby = await this.outletOrchestrator.getNearbyOutlets(
      latitude,
      longitude,
    );

    if (nearby.length === 0) {
      return null;
    }

    return nearby[0].outlet.id;
  }

  /* ================================================= */
  /* PRIMARY                                           */
  /* ================================================= */

  async getPrimaryAddress(
    customerId: string,
  ): Promise<SavedAddress | null> {
    const addresses =
      await this.savedAddressRepo.findAllByCustomer(customerId);

    return addresses.find((a) => a.isActive()) ?? null;
  }

  /* ================================================= */
  /* CREATE (RESTORE OR CREATE)                        */
  /* ================================================= */

  async createSavedAddress(
    address: SavedAddress,
  ): Promise<SavedAddress> {
    const resolvedOutletId = await this.resolveOutletIdForCoordinates(
      address.latitude,
      address.longitude,
    );

    const addressWithOutlet = SavedAddress.createNew({
      id: address.id,
      customerId: address.customerId,
      type: address.type,
      label: address.label,
      addressText: address.addressText,
      latitude: address.latitude ?? undefined,
      longitude: address.longitude ?? undefined,
      resolvedOutletId,
      now: address.createdAt,
    });

    let result!: SavedAddress;

    await this.prisma.$transaction(async (tx) => {

      if (
        addressWithOutlet.type === SavedAddressType.HOME ||
        addressWithOutlet.type === SavedAddressType.WORK
      ) {
        const active =
          await this.savedAddressRepo.findActiveByCustomerAndType(
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

      /* 2️⃣ Restore deleted (HOME/WORK only) */
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
          const restored = deleted
            .restore()
            .updateDetails({
              label: addressWithOutlet.label,
              addressText: addressWithOutlet.addressText,
              latitude: addressWithOutlet.latitude,
              longitude: addressWithOutlet.longitude,
              resolvedOutletId,
            });

          result = await this.savedAddressRepo.save(restored, tx);
          return;
        }
      }

      /* 3️⃣ Create new (OTHER unlimited) */
      result = await this.savedAddressRepo.create(addressWithOutlet, tx);
    });

    /* 🔥 EVENTS */
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

    const resolvedOutletId = await this.resolveOutletIdForCoordinates(
      params.latitude !== undefined ? params.latitude : address.latitude,
      params.longitude !== undefined ? params.longitude : address.longitude,
    );

    const updated = address.updateDetails({
      ...(params.label !== undefined && { label: params.label }),
      ...(params.addressText !== undefined && {
        addressText: params.addressText,
      }),
      ...(params.latitude !== undefined && {
        latitude: params.latitude,
      }),
      ...(params.longitude !== undefined && {
        longitude: params.longitude,
      }),
      resolvedOutletId,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.savedAddressRepo.save(updated, tx);
    });

    /* 🔥 EVENTS */
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

    /* 🔥 EVENTS */
    this.savedAddressEvents.emitSavedAddressDeleted({
      savedAddressId: deleted.id,
      customerId: deleted.customerId,
    });

    return { id: deleted.id, deleted: true };
  }
}
