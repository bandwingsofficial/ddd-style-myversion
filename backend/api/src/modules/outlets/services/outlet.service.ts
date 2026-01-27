// src/modules/outlets/services/outlet.service.ts

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { Outlet } from '../domain/models/outlet.model';
import { OutletRepository } from '../repositories/outlet.repository';

import { OutletActivePolicy } from '../policies/outlet-active.policy';
import { OutletWorkingPolicy } from '../policies/outlet-working.policy';
import { CameraOnPolicy } from '../policies/camera-on.policy';
import { CameraOffPolicy } from '../policies/camera-off.policy';

import { AuditLogRepository } from '../../auth/repositories/audit-log.repository';
import { ActorType } from '../../auth/domain/enums/actor-type.enum';
import { AuditAction } from '../../auth/domain/enums/audit-action.enum';

import { ValidationError } from '../../../common/errors';
import { GeoLocation } from '../domain/value-objects/geo-location.vo';
import { OutletStatus } from '../domain/enums/outlet-status.enum';

/* 🔥 ADD */
import { OutletEventsService } from '../events/outlet-events.service';
import { OutletWorkingStatus } from '../domain/enums/outlet-working-status.enum';

@Injectable()
export class OutletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outletRepo: OutletRepository,
    private readonly auditRepo: AuditLogRepository,
    /* 🔥 ADD */
    private readonly outletEvents: OutletEventsService,
  ) {}

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  async getById(outletId: string): Promise<Outlet> {
    const outlet = await this.outletRepo.findById(outletId);

    if (!outlet) {
      throw new ValidationError(
        'OUTLET_NOT_FOUND',
        'Outlet not found',
      );
    }

    return outlet;
  }

  /* ================================================= */
/* READ – ALL OUTLETS                                 */
/* ================================================= */

async getAllOutlets(): Promise<Outlet[]> {
  return this.outletRepo.findAll();
}
/* ================================================= */
/* ⭐ PUBLIC – NEARBY OUTLETS (GEO FILTER)            */
/* ================================================= */

async getNearbyOutlets(
  lat: number,
  lng: number,
): Promise<Outlet[]> {

  /* 🔒 SAFETY */
  if (isNaN(lat) || isNaN(lng)) return [];

  const outlets = await this.outletRepo.findAll();

  const result: Outlet[] = [];

  for (const outlet of outlets) {
    /* --------------------------------------------- */
    /* 1️⃣ ONLY ACTIVE                               */
    /* --------------------------------------------- */
    if (!outlet.isActive()) continue;

    /* --------------------------------------------- */
    /* 2️⃣ ONLY WORKING = OPEN                       */
    /* --------------------------------------------- */
    if (!outlet.workingState?.canAcceptOrders()) continue;

    /* --------------------------------------------- */
    /* 3️⃣ MUST HAVE LOCATION                        */
    /* --------------------------------------------- */
    const location = outlet.location?.getRaw();
    if (!location) continue;

    const { latitude: outletLat, longitude: outletLng } = location;

    /* --------------------------------------------- */
    /* 4️⃣ DISTANCE CHECK (Haversine)                */
    /* --------------------------------------------- */
    const distanceKm = this.calculateDistanceKm(
      lat,
      lng,
      outletLat,
      outletLng,
    );

    const radius = outlet.deliveryRadiusKm ?? 5;

    if (distanceKm <= radius) {
      result.push(outlet);
    }
  }

  return result;
}


  /* ================================================= */
  /* CREATE OUTLET (ADMIN)                              */
  /* ================================================= */

  async createOutlet(params: {
    outlet: Outlet;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<Outlet> {
    let created!: Outlet;

    await this.prisma.$transaction(async (tx) => {
      created = await this.outletRepo.create(params.outlet, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_CREATED,
          metadata: {
            outletId: created.id,
            name: created.name,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    return created;
  }

  /* ================================================= */
  /* UPDATE OUTLET DETAILS (ADMIN)                     */
  /* ================================================= */

  async updateDetails(params: {
    outletId: string;
    updates: {
      name?: string;
      branch?: string;
      latitude?: number;
      longitude?: number;
      deliveryRadiusKm?: number;
    };
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<Outlet> {
    const outlet = await this.outletRepo.findById(params.outletId);
    if (!outlet) {
      throw new ValidationError('OUTLET_NOT_FOUND', 'Outlet not found');
    }

    OutletActivePolicy.enforce(outlet);

    const updatedLocation =
      params.updates.latitude !== undefined ||
      params.updates.longitude !== undefined
        ? GeoLocation.create(
            params.updates.latitude ?? outlet.location?.getRaw().latitude ?? 0,
            params.updates.longitude ?? outlet.location?.getRaw().longitude ?? 0,
          )
        : outlet.location;

    const updatedOutlet = outlet.updateDetails({
      name: params.updates.name,
      branch: params.updates.branch,
      location: updatedLocation,
      deliveryRadiusKm: params.updates.deliveryRadiusKm,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.outletRepo.updateDetails(updatedOutlet, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_UPDATED,
          metadata: {
            outletId: outlet.id,
            updatedFields: Object.keys(params.updates),
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    return updatedOutlet;
  }

  /* ================================================= */
  /* ENABLE / DISABLE OUTLET                            */
  /* ================================================= */

  async disableOutlet(params: {
    outletId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ id: string; status: 'INACTIVE' }> {
    const outlet = await this.outletRepo.findById(params.outletId);
    if (!outlet) {
      throw new ValidationError('OUTLET_NOT_FOUND', 'Outlet not found');
    }

    if (!outlet.isActive()) {
      return { id: outlet.id, status: 'INACTIVE' };
    }

    const disabled = outlet.disable();

    await this.prisma.$transaction(async (tx) => {
      await this.outletRepo.updateStatus(disabled, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_DISABLED,
          metadata: { outletId: outlet.id },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    /* 🔥 ADD */
    this.outletEvents.emitOutletDisabled({ outletId: outlet.id });

    return { id: outlet.id, status: 'INACTIVE' };
  }

  async enableOutlet(params: {
    outletId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ id: string; status: 'ACTIVE' }> {
    const outlet = await this.outletRepo.findById(params.outletId);
    if (!outlet) {
      throw new ValidationError('OUTLET_NOT_FOUND', 'Outlet not found');
    }

    if (outlet.isActive()) {
      return { id: outlet.id, status: 'ACTIVE' };
    }

    const enabled = Outlet.rehydrate({
      ...outlet,
      status: OutletStatus.ACTIVE,
      updatedAt: new Date(),
    });

    await this.prisma.$transaction(async (tx) => {
      await this.outletRepo.updateStatus(enabled, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_ENABLED,
          metadata: { outletId: outlet.id },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    /* 🔥 ADD */
    this.outletEvents.emitOutletEnabled({ outletId: outlet.id });

    return { id: outlet.id, status: 'ACTIVE' };
  }

  /* ================================================= */
  /* WORKING STATUS                                    */
  /* ================================================= */

  async openOutlet(params: {
    outletId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const outlet = await this.outletRepo.findById(params.outletId);
    if (!outlet) throw new ValidationError('OUTLET_NOT_FOUND', 'Outlet not found');

    OutletActivePolicy.enforce(outlet);

    const updated = outlet.openShop();

    await this.prisma.$transaction(async (tx) => {
      await this.outletRepo.updateWorkingState(updated, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_OPENED,
          metadata: { outletId: outlet.id },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    /* 🔥 ADD */
    this.outletEvents.emitWorkingStatusChanged({
      outletId: outlet.id,
      status: OutletWorkingStatus.OPEN,
    });
  }

  async closeOutlet(params: {
    outletId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const outlet = await this.outletRepo.findById(params.outletId);
    if (!outlet) throw new ValidationError('OUTLET_NOT_FOUND', 'Outlet not found');

    const updated = outlet.closeShop();

    await this.prisma.$transaction(async (tx) => {
      await this.outletRepo.updateWorkingState(updated, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_CLOSED,
          metadata: { outletId: outlet.id },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    /* 🔥 ADD */
    this.outletEvents.emitWorkingStatusChanged({
      outletId: outlet.id,
      status: OutletWorkingStatus.CLOSED,
    });
  }

  async temporarilyCloseOutlet(params: {
    outletId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const outlet = await this.outletRepo.findById(params.outletId);
    if (!outlet) throw new ValidationError('OUTLET_NOT_FOUND', 'Outlet not found');

    const updated = outlet.temporarilyCloseShop();

    await this.prisma.$transaction(async (tx) => {
      await this.outletRepo.updateWorkingState(updated, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_TEMPORARILY_CLOSED,
          metadata: { outletId: outlet.id },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    /* 🔥 ADD */
    this.outletEvents.emitWorkingStatusChanged({
      outletId: outlet.id,
      status: OutletWorkingStatus.TEMPORARILY_CLOSED,
    });
  }

  /* ================================================= */
  /* CAMERA                                            */
  /* ================================================= */

  async turnCameraOn(params: {
    outletId: string;
    streamUrl: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const outlet = await this.outletRepo.findById(params.outletId);
    if (!outlet) throw new ValidationError('OUTLET_NOT_FOUND', 'Outlet not found');

    OutletActivePolicy.enforce(outlet);
    OutletWorkingPolicy.enforce(outlet);
    CameraOnPolicy.enforce(outlet);

    const updated = outlet.turnCameraOn(params.streamUrl);

    await this.prisma.$transaction(async (tx) => {
      await this.outletRepo.updateCameraState(updated, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_CAMERA_ON,
          metadata: { outletId: outlet.id },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    /* 🔥 ADD */
    this.outletEvents.emitCameraStatusChanged({
      outletId: outlet.id,
      status: 'ON',
    });
  }

  async turnCameraOff(params: {
    outletId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const outlet = await this.outletRepo.findById(params.outletId);
    if (!outlet) throw new ValidationError('OUTLET_NOT_FOUND', 'Outlet not found');

    CameraOffPolicy.enforce(outlet);

    const updated = outlet.turnCameraOff();

    await this.prisma.$transaction(async (tx) => {
      await this.outletRepo.updateCameraState(updated, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_CAMERA_OFF,
          metadata: { outletId: outlet.id },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    /* 🔥 ADD */
    this.outletEvents.emitCameraStatusChanged({
      outletId: outlet.id,
      status: 'OFF',
    });
  }

  /* ================================================= */
/* INTERNAL – HAVERSINE DISTANCE                     */
/* ================================================= */

private calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;

  const R = 6371; // earth radius km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

}
