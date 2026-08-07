// src/modules/outlets/repositories/outlet.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Outlet } from '../domain/models/outlet.model';
import { OutletProfile } from '../domain/models/outlet-profile.model';

import { OutletStatusMapper } from '../mappers/outlet-status.mapper';
import { OutletWorkingStateMapper } from '../mappers/outlet-working-state.mapper';
import { CameraStateMapper } from '../mappers/camera-state.mapper';
import { GeoLocationMapper } from '../mappers/geo-location.mapper';
import {
  OutletPublicBundle,
  OutletPublicExtras,
} from '../types/outlet-public-bundle.types';

@Injectable()
export class OutletRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE                                            */
  /* ================================================= */

  async create(outlet: Outlet, tx?: PrismaTransaction): Promise<Outlet> {
    const client = tx ?? this.prisma;

    const row = await client.outlet.create({
      data: {
        id: outlet.id,
        name: outlet.name,
        branch: outlet.branch,
        address: outlet.address,
        pincode: outlet.pincode,

        status: OutletStatusMapper.toPrisma(outlet.status),
        workingStatus: OutletWorkingStateMapper.toPrisma(outlet.workingState),

        ...CameraStateMapper.toPrisma(outlet.cameraState),
        ...GeoLocationMapper.toPrisma(outlet.location),

        deliveryRadiusKm: outlet.deliveryRadiusKm,
        isCentral: outlet.isCentral,

        createdBy: outlet.createdBy,
        createdAt: outlet.createdAt,
        updatedAt: outlet.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  async findById(id: string, tx?: PrismaTransaction): Promise<Outlet | null> {
    const row = await (tx ?? this.prisma).outlet.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  async existsById(id: string, tx?: PrismaTransaction): Promise<boolean> {
    const outlet = await (tx ?? this.prisma).outlet.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!outlet;
  }

  /* ================================================= */
  /* READ – ALL OUTLETS                                */
  /* ================================================= */

  async findAll(tx?: PrismaTransaction): Promise<Outlet[]> {
    const rows = await (tx ?? this.prisma).outlet.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rows.map((row) => this.toDomain(row));
  }

  /* ================================================= */
  /* READ – OUTLETS WITH LOCATION ONLY                 */
  /* ================================================= */

  async findWithLocation(tx?: PrismaTransaction): Promise<Outlet[]> {
    const rows = await (tx ?? this.prisma).outlet.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    return rows.map((row) => this.toDomain(row));
  }

  /* ================================================= */
  /* READ – PUBLIC BUNDLES (outlet + profile + extras)  */
  /* ================================================= */

  async findAllPublicBundles(
    tx?: PrismaTransaction,
  ): Promise<OutletPublicBundle[]> {
    const rows = await (tx ?? this.prisma).outlet.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => this.toPublicBundle(row));
  }

  async findPublicBundleById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<OutletPublicBundle | null> {
    const row = await (tx ?? this.prisma).outlet.findUnique({
      where: { id },
      include: { profile: true },
    });

    return row ? this.toPublicBundle(row) : null;
  }

  async findPublicBundlesWithLocation(
    tx?: PrismaTransaction,
  ): Promise<OutletPublicBundle[]> {
    const rows = await (tx ?? this.prisma).outlet.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      include: { profile: true },
    });

    return rows.map((row) => this.toPublicBundle(row));
  }
  /* ================================================= */
  /* UPDATE DETAILS (PARTIAL STRUCTURAL UPDATE)        */
  /* ================================================= */

  async updateDetails(outlet: Outlet, tx?: PrismaTransaction): Promise<Outlet> {
    const client = tx ?? this.prisma;

    const row = await client.outlet.update({
      where: { id: outlet.id },
      data: {
        name: outlet.name,
        branch: outlet.branch,
        address: outlet.address,
        pincode: outlet.pincode,

        ...GeoLocationMapper.toPrisma(outlet.location),

        deliveryRadiusKm: outlet.deliveryRadiusKm,
        updatedAt: outlet.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* UPDATE (FULL AGGREGATE – DOMAIN CONTROLLED)       */
  /* ================================================= */

  async update(outlet: Outlet, tx?: PrismaTransaction): Promise<Outlet> {
    const client = tx ?? this.prisma;

    const row = await client.outlet.update({
      where: { id: outlet.id },
      data: {
        name: outlet.name,
        branch: outlet.branch,
        address: outlet.address,
        pincode: outlet.pincode,

        status: OutletStatusMapper.toPrisma(outlet.status),
        workingStatus: OutletWorkingStateMapper.toPrisma(outlet.workingState),

        ...CameraStateMapper.toPrisma(outlet.cameraState),
        ...GeoLocationMapper.toPrisma(outlet.location),

        deliveryRadiusKm: outlet.deliveryRadiusKm,
        isCentral: outlet.isCentral,

        updatedAt: outlet.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* STATUS (ENABLE / DISABLE)                          */
  /* ================================================= */

  async updateStatus(outlet: Outlet, tx?: PrismaTransaction): Promise<Outlet> {
    const client = tx ?? this.prisma;

    const row = await client.outlet.update({
      where: { id: outlet.id },
      data: {
        status: OutletStatusMapper.toPrisma(outlet.status),
        workingStatus: OutletWorkingStateMapper.toPrisma(outlet.workingState),

        ...CameraStateMapper.toPrisma(outlet.cameraState),

        updatedAt: outlet.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* WORKING STATUS (OPEN / CLOSE / TEMP CLOSE)         */
  /* ================================================= */

  async updateWorkingState(
    outlet: Outlet,
    tx?: PrismaTransaction,
  ): Promise<Outlet> {
    const client = tx ?? this.prisma;

    const row = await client.outlet.update({
      where: { id: outlet.id },
      data: {
        workingStatus: OutletWorkingStateMapper.toPrisma(outlet.workingState),
        updatedAt: outlet.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* CAMERA (ON / OFF / MAINTENANCE)                    */
  /* ================================================= */

  async updateCameraState(
    outlet: Outlet,
    tx?: PrismaTransaction,
  ): Promise<Outlet> {
    const client = tx ?? this.prisma;

    const row = await client.outlet.update({
      where: { id: outlet.id },
      data: {
        ...CameraStateMapper.toPrisma(outlet.cameraState),
        updatedAt: outlet.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  async hardDelete(outletId: string, tx?: PrismaTransaction): Promise<void> {
    const client = tx ?? this.prisma;
    await client.outlet.delete({ where: { id: outletId } });
  }

  async countOrdersByOutletId(outletId: string): Promise<number> {
    return this.prisma.order.count({ where: { outletId } });
  }

  async countStockTransactionsByOutletId(outletId: string): Promise<number> {
    return this.prisma.stockTransaction.count({ where: { outletId } });
  }

  async countOutletProductsByOutletId(outletId: string): Promise<number> {
    return this.prisma.outletProduct.count({ where: { outletId } });
  }

  async countOutletStocksByOutletId(outletId: string): Promise<number> {
    return this.prisma.outletStock.count({ where: { outletId } });
  }

  async countOutletUsersByOutletId(outletId: string): Promise<number> {
    return this.prisma.outletUser.count({ where: { outletId } });
  }

  async countCartsByOutletId(outletId: string): Promise<number> {
    return this.prisma.cart.count({ where: { outletId } });
  }

  async deleteRemovableOutletDependencies(
    outletId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    await client.cartItem.deleteMany({
      where: { cart: { outletId } },
    });
    await client.cart.deleteMany({ where: { outletId } });
    await client.outletProduct.deleteMany({ where: { outletId } });
    await client.outletStock.deleteMany({ where: { outletId } });
    await client.outletUser.deleteMany({ where: { outletId } });
    await client.outletProfile.deleteMany({ where: { outletId } });
  }

  /* ================================================= */
  /* PRIVATE MAPPER                                    */
  /* ================================================= */

  private toPublicBundle(row: OutletRowWithProfile): OutletPublicBundle {
    return {
      outlet: this.toDomain(row),
      profile: row.profile ? this.toProfileDomain(row.profile) : null,
      extras: this.toPublicExtras(row),
    };
  }

  private toPublicExtras(row: OutletRowWithProfile): OutletPublicExtras {
    return {
      displayName: row.displayName ?? undefined,
      code: row.code ?? undefined,
      alternatePhone: row.alternatePhone ?? undefined,
      addressLine2: row.addressLine2 ?? undefined,
      landmark: row.landmark ?? undefined,
      area: row.area ?? undefined,
      city: row.city ?? undefined,
      state: row.state ?? undefined,
      country: row.country ?? undefined,
      formattedAddress: row.formattedAddress ?? undefined,
      locationText: row.location ?? undefined,
      openingTime: row.openingTime ?? undefined,
      closingTime: row.closingTime ?? undefined,
      estimatedDeliveryMinutes: row.estimatedDeliveryMinutes ?? undefined,
      googleMapsUrl: row.googleMapsUrl ?? undefined,
      supportWhatsapp: row.profile?.supportWhatsapp ?? undefined,
    };
  }

  private toProfileDomain(row: {
    id: string;
    outletId: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    ownerName: string | null;
    description: string | null;
    gstNumber: string | null;
    fssaiNumber: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): OutletProfile {
    return OutletProfile.rehydrate({
      id: row.id,
      outletId: row.outletId,
      avatarUrl: row.avatarUrl ?? undefined,
      bannerUrl: row.bannerUrl ?? undefined,
      contactPhone: row.contactPhone ?? undefined,
      contactEmail: row.contactEmail ?? undefined,
      ownerName: row.ownerName ?? undefined,
      description: row.description ?? undefined,
      gstNumber: row.gstNumber ?? undefined,
      fssaiNumber: row.fssaiNumber ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toDomain(row: OutletRowBase): Outlet {
    return Outlet.rehydrate({
      id: row.id,
      name: row.name,
      branch: row.branch ?? undefined,
      address: row.address ?? undefined,
      pincode: row.pincode ?? undefined,

      status: OutletStatusMapper.toDomain(row.status),
      workingState: OutletWorkingStateMapper.toDomain(row.workingStatus),

      cameraState: CameraStateMapper.toDomain({
        isCameraEnabled: row.isCameraEnabled,
        cameraStatus: row.cameraStatus,
        cameraStreamUrl: row.cameraStreamUrl,
      }),

      location: GeoLocationMapper.toDomain(row.latitude, row.longitude),

      deliveryRadiusKm: row.deliveryRadiusKm ?? undefined,
      isCentral: row.isCentral,

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      createdBy: row.createdBy ?? undefined,
    });
  }
}

type OutletRowBase = {
  id: string;
  name: string;
  branch: string | null;
  address: string | null;
  pincode: string | null;
  location: string | null;
  displayName: string | null;
  code: string | null;
  alternatePhone: string | null;
  addressLine2: string | null;
  landmark: string | null;
  area: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  formattedAddress: string | null;
  openingTime: string | null;
  closingTime: string | null;
  estimatedDeliveryMinutes: number | null;
  googleMapsUrl: string | null;
  status: any;
  workingStatus: any;
  isCameraEnabled: boolean;
  cameraStatus: any;
  cameraStreamUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  deliveryRadiusKm: number | null;
  isCentral: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
};

type OutletRowWithProfile = OutletRowBase & {
  profile: {
    id: string;
    outletId: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
    supportWhatsapp: string | null;
    ownerName: string | null;
    description: string | null;
    gstNumber: string | null;
    fssaiNumber: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};
