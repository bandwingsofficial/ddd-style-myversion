// src/modules/outlets/repositories/outlet.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Outlet } from '../domain/models/outlet.model';

import { OutletStatusMapper } from '../mappers/outlet-status.mapper';
import { OutletWorkingStateMapper } from '../mappers/outlet-working-state.mapper';
import { CameraStateMapper } from '../mappers/camera-state.mapper';
import { GeoLocationMapper } from '../mappers/geo-location.mapper';

@Injectable()
export class OutletRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE                                            */
  /* ================================================= */

  async create(
    outlet: Outlet,
    tx?: PrismaTransaction,
  ): Promise<Outlet> {
    const client = tx ?? this.prisma;

    const row = await client.outlet.create({
      data: {
        id: outlet.id,
        name: outlet.name,
        branch: outlet.branch,

        status: OutletStatusMapper.toPrisma(outlet.status),
        workingStatus: OutletWorkingStateMapper.toPrisma(
          outlet.workingState,
        ),

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

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<Outlet | null> {
    const row = await (tx ?? this.prisma).outlet.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  async existsById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<boolean> {
    const outlet = await (tx ?? this.prisma).outlet.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!outlet;
  }


  /* ================================================= */
/* READ – ALL OUTLETS                                */
/* ================================================= */

async findAll(
  tx?: PrismaTransaction,
): Promise<Outlet[]> {
  const rows = await (tx ?? this.prisma).outlet.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return rows.map(row => this.toDomain(row));
}

  /* ================================================= */
  /* UPDATE DETAILS (PARTIAL STRUCTURAL UPDATE)        */
  /* ================================================= */

  async updateDetails(
    outlet: Outlet,
    tx?: PrismaTransaction,
  ): Promise<Outlet> {
    const client = tx ?? this.prisma;

    const row = await client.outlet.update({
      where: { id: outlet.id },
      data: {
        name: outlet.name,
        branch: outlet.branch,

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

  async update(
    outlet: Outlet,
    tx?: PrismaTransaction,
  ): Promise<Outlet> {
    const client = tx ?? this.prisma;

    const row = await client.outlet.update({
      where: { id: outlet.id },
      data: {
        name: outlet.name,
        branch: outlet.branch,

        status: OutletStatusMapper.toPrisma(outlet.status),
        workingStatus: OutletWorkingStateMapper.toPrisma(
          outlet.workingState,
        ),

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

  async updateStatus(
    outlet: Outlet,
    tx?: PrismaTransaction,
  ): Promise<Outlet> {
    const client = tx ?? this.prisma;

    const row = await client.outlet.update({
      where: { id: outlet.id },
      data: {
        status: OutletStatusMapper.toPrisma(outlet.status),
        workingStatus: OutletWorkingStateMapper.toPrisma(
          outlet.workingState,
        ),

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
        workingStatus: OutletWorkingStateMapper.toPrisma(
          outlet.workingState,
        ),
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

  /* ================================================= */
  /* PRIVATE MAPPER                                    */
  /* ================================================= */

  private toDomain(row: {
    id: string;
    name: string;
    branch: string | null;

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
  }): Outlet {
    return Outlet.rehydrate({
      id: row.id,
      name: row.name,
      branch: row.branch ?? undefined,

      status: OutletStatusMapper.toDomain(row.status),
      workingState: OutletWorkingStateMapper.toDomain(
        row.workingStatus,
      ),

      cameraState: CameraStateMapper.toDomain({
        isCameraEnabled: row.isCameraEnabled,
        cameraStatus: row.cameraStatus,
        cameraStreamUrl: row.cameraStreamUrl,
      }),

      location: GeoLocationMapper.toDomain(
        row.latitude,
        row.longitude,
      ),

      deliveryRadiusKm: row.deliveryRadiusKm ?? undefined,
      isCentral: row.isCentral,

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      createdBy: row.createdBy ?? undefined,
    });
  }
}
