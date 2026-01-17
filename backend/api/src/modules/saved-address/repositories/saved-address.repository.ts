import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { SavedAddress } from '../domain/models/saved-address.model';
import { SavedAddressType } from '../domain/enums/saved-address-type.enum';
import { SavedAddressTypeMapper } from '../mappers/saved-address-type.mapper';

@Injectable()
export class SavedAddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE (NEW ONLY)                                 */
  /* ================================================= */

  async create(
    address: SavedAddress,
    tx?: PrismaTransaction,
  ): Promise<SavedAddress> {
    const client = tx ?? this.prisma;

    const row = await client.customerSavedAddress.create({
      data: {
        id: address.id,
        customerId: address.customerId,
        type: SavedAddressTypeMapper.toPrisma(address.type),
        label: address.label,
        addressText: address.addressText,
        latitude: address.latitude,
        longitude: address.longitude,
        isDeleted: address.isDeleted,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* READ (SINGLE – ACTIVE)                            */
  /* ================================================= */

  async findById(
    id: string,
    customerId: string,
    tx?: PrismaTransaction,
  ): Promise<SavedAddress | null> {
    const row =
      await (tx ?? this.prisma).customerSavedAddress.findFirst({
        where: {
          id,
          customerId,
          isDeleted: false,
        },
      });

    return row ? this.toDomain(row) : null;
  }

  async existsById(
    id: string,
    customerId: string,
    tx?: PrismaTransaction,
  ): Promise<boolean> {
    const address =
      await (tx ?? this.prisma).customerSavedAddress.findFirst({
        where: {
          id,
          customerId,
          isDeleted: false,
        },
        select: { id: true },
      });

    return !!address;
  }

  /* ================================================= */
  /* READ (LIST – ACTIVE)                              */
  /* ================================================= */

  async findAllByCustomer(
    customerId: string,
    tx?: PrismaTransaction,
  ): Promise<SavedAddress[]> {
    const rows =
      await (tx ?? this.prisma).customerSavedAddress.findMany({
        where: {
          customerId,
          isDeleted: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    return rows.map((row) => this.toDomain(row));
  }

  /* ================================================= */
  /* OPTION B SUPPORT                                  */
  /* ================================================= */

  async findActiveByCustomerAndType(
    customerId: string,
    type: SavedAddressType,
    tx?: PrismaTransaction,
  ): Promise<SavedAddress | null> {
    const row =
      await (tx ?? this.prisma).customerSavedAddress.findFirst({
        where: {
          customerId,
          type: SavedAddressTypeMapper.toPrisma(type),
          isDeleted: false,
        },
      });

    return row ? this.toDomain(row) : null;
  }

  async findDeletedByCustomerAndType(
    customerId: string,
    type: SavedAddressType,
    tx?: PrismaTransaction,
  ): Promise<SavedAddress | null> {
    const row =
      await (tx ?? this.prisma).customerSavedAddress.findFirst({
        where: {
          customerId,
          type: SavedAddressTypeMapper.toPrisma(type),
          isDeleted: true,
        },
      });

    return row ? this.toDomain(row) : null;
  }

  /* ================================================= */
  /* SAVE (FULL AGGREGATE)                             */
  /* Used for update / restore                         */
  /* ================================================= */

  async save(
    address: SavedAddress,
    tx?: PrismaTransaction,
  ): Promise<SavedAddress> {
    const client = tx ?? this.prisma;

    const row = await client.customerSavedAddress.update({
      where: { id: address.id },
      data: {
        label: address.label,
        addressText: address.addressText,
        latitude: address.latitude,
        longitude: address.longitude,
        isDeleted: address.isDeleted,
        updatedAt: address.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* DELETE (SOFT DELETE)                              */
  /* ================================================= */

  async softDelete(
    address: SavedAddress,
    tx?: PrismaTransaction,
  ): Promise<SavedAddress> {
    const client = tx ?? this.prisma;

    const row = await client.customerSavedAddress.update({
      where: { id: address.id },
      data: {
        isDeleted: true,
        updatedAt: address.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* PRIVATE MAPPER                                   */
  /* ================================================= */

  private toDomain(row: {
    id: string;
    customerId: string;
    type: any;
    label: string;
    addressText: string;
    latitude: number | null;
    longitude: number | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): SavedAddress {
    return SavedAddress.rehydrate({
      id: row.id,
      customerId: row.customerId,
      type: SavedAddressTypeMapper.toDomain(row.type),
      label: row.label,
      addressText: row.addressText,
      latitude: row.latitude,
      longitude: row.longitude,
      isDeleted: row.isDeleted,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
