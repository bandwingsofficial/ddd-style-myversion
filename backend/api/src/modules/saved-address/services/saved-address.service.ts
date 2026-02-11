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

@Injectable()
export class SavedAddressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly savedAddressRepo: SavedAddressRepository,
    private readonly savedAddressEvents: SavedAddressEventsService,
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
    let result!: SavedAddress;

    await this.prisma.$transaction(async (tx) => {

      /* ✅ Only HOME/WORK uniqueness check */
      if (
        address.type === SavedAddressType.HOME ||
        address.type === SavedAddressType.WORK
      ) {
        const active =
          await this.savedAddressRepo.findActiveByCustomerAndType(
            address.customerId,
            address.type,
            tx,
          );

        if (active) {
          throw new ValidationError(
            'SAVED_ADDRESS_TYPE_ALREADY_EXISTS',
            `Active ${address.type} address already exists`,
          );
        }
      }

      /* 2️⃣ Restore deleted (HOME/WORK only) */
      if (
        address.type === SavedAddressType.HOME ||
        address.type === SavedAddressType.WORK
      ) {
        const deleted =
          await this.savedAddressRepo.findDeletedByCustomerAndType(
            address.customerId,
            address.type,
            tx,
          );

        if (deleted) {
          const restored = deleted
            .restore()
            .updateDetails({
              label: address.label,
              addressText: address.addressText,
              latitude: address.latitude,
              longitude: address.longitude,
            });

          result = await this.savedAddressRepo.save(restored, tx);
          return;
        }
      }

      /* 3️⃣ Create new (OTHER unlimited) */
      result = await this.savedAddressRepo.create(address, tx);
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
