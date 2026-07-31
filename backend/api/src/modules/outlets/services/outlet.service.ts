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
import { OutletUserService } from './outlet-user.service';
import {
  DeleteAnalysis,
  DELETE_ERROR_CODES,
} from '../../../common/types/delete-analysis.types';

@Injectable()
export class OutletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outletRepo: OutletRepository,
    private readonly auditRepo: AuditLogRepository,
    /* 🔥 ADD */
    private readonly outletEvents: OutletEventsService,
    private readonly outletUserService: OutletUserService,
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
): Promise<{ outlet: Outlet; distanceKm: number }[]> {
  if (isNaN(lat) || isNaN(lng)) return [];

  const outlets = await this.outletRepo.findWithLocation();

return outlets
  .filter(o =>
    o.isActive() &&
    o.workingState?.canAcceptOrders() &&
    o.location
  )
  .map(o => {
    const location = o.location.getRaw();
    const distanceKm = this.calculateDistanceKm(lat, lng, location.latitude, location.longitude);

    if (distanceKm > (o.deliveryRadiusKm ?? 5)) return null;

    return {
      outlet: o,
      distanceKm: Number(distanceKm.toFixed(2)),
    };
  })
  .filter(Boolean)
  .sort((a, b) => a!.distanceKm - b!.distanceKm);
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
      address?: string;
      pincode?: string;
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

    let updatedLocation = outlet.location;

if (
  params.updates.latitude !== undefined ||
  params.updates.longitude !== undefined
) {
  if (
    params.updates.latitude === undefined ||
    params.updates.longitude === undefined
  ) {
    throw new ValidationError(
      'INVALID_LOCATION',
      'Both latitude and longitude are required',
    );
  }

  updatedLocation = GeoLocation.create(
    params.updates.latitude,
    params.updates.longitude,
  );
}

    const updatedOutlet = outlet.updateDetails({
      name: params.updates.name,
      branch: params.updates.branch,
      address: params.updates.address,
      pincode: params.updates.pincode,
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

    let syncResult = {
      userIds: [] as string[],
      usersInactivated: 0,
      sessionsRevoked: 0,
    };

    await this.prisma.$transaction(async (tx) => {
      await this.outletRepo.updateStatus(disabled, tx);

      syncResult = await this.outletUserService.inactivateAllUsersForOutlet(
        {
          outletId: outlet.id,
          adminId: params.adminId,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_DISABLED,
          metadata: {
            outletId: outlet.id,
            usersInactivated: syncResult.usersInactivated,
            sessionsRevoked: syncResult.sessionsRevoked,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    this.outletEvents.emitOutletDisabled({ outletId: outlet.id });
    this.outletEvents.emitOutletInactivated({ outletId: outlet.id });

    if (syncResult.usersInactivated > 0) {
      this.outletEvents.emitOutletUsersInactivated({
        outletId: outlet.id,
        userIds: syncResult.userIds,
        usersInactivated: syncResult.usersInactivated,
      });
    }

    if (syncResult.sessionsRevoked > 0) {
      this.outletEvents.emitUserSessionsInvalidated({
        outletId: outlet.id,
        actorType: 'OUTLET_USER',
        sessionsRevoked: syncResult.sessionsRevoked,
      });
    }

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
    this.outletEvents.emitOutletActivated({ outletId: outlet.id });

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

  async configureCamera(params: {
    outletId: string;
    enabled: boolean;
    streamUrl?: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<Outlet> {
    const outlet = await this.outletRepo.findById(params.outletId);
    if (!outlet) {
      throw new ValidationError('OUTLET_NOT_FOUND', 'Outlet not found');
    }

    OutletActivePolicy.enforce(outlet);

    const updated = outlet.configureCamera({
      enabled: params.enabled,
      streamUrl: params.streamUrl,
    });

    await this.prisma.$transaction(async (tx) => {
      await this.outletRepo.updateCameraState(updated, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: params.enabled
            ? AuditAction.OUTLET_CAMERA_ON
            : AuditAction.OUTLET_CAMERA_OFF,
          metadata: {
            outletId: outlet.id,
            configured: true,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    return updated;
  }

  async analyzeOutletDelete(outletId: string): Promise<DeleteAnalysis> {
    await this.getById(outletId);

    const [
      orderCount,
      transactionCount,
      productCount,
      stockCount,
      userCount,
      cartCount,
    ] = await Promise.all([
      this.outletRepo.countOrdersByOutletId(outletId),
      this.outletRepo.countStockTransactionsByOutletId(outletId),
      this.outletRepo.countOutletProductsByOutletId(outletId),
      this.outletRepo.countOutletStocksByOutletId(outletId),
      this.outletRepo.countOutletUsersByOutletId(outletId),
      this.outletRepo.countCartsByOutletId(outletId),
    ]);

    const permanentBlockers = [];
    const removableDependencies = [];

    if (orderCount > 0) {
      permanentBlockers.push({
        type: 'ORDERS',
        label: 'Orders',
        count: orderCount,
      });
    }

    if (transactionCount > 0) {
      permanentBlockers.push({
        type: 'STOCK_TRANSACTIONS',
        label: 'Inventory Transactions',
        count: transactionCount,
      });
    }

    if (productCount > 0) {
      removableDependencies.push({
        type: 'OUTLET_PRODUCTS',
        label: 'Outlet Product Assignments',
        count: productCount,
      });
    }

    if (stockCount > 0) {
      removableDependencies.push({
        type: 'OUTLET_STOCK',
        label: 'Outlet Stock Records',
        count: stockCount,
      });
    }

    if (userCount > 0) {
      removableDependencies.push({
        type: 'OUTLET_USERS',
        label: 'Outlet Users',
        count: userCount,
      });
    }

    if (cartCount > 0) {
      removableDependencies.push({
        type: 'CARTS',
        label: 'Active Carts',
        count: cartCount,
      });
    }

    const canDelete =
      permanentBlockers.length === 0 && removableDependencies.length === 0;
    const canForceDelete =
      permanentBlockers.length === 0 && removableDependencies.length > 0;

    return {
      canDelete,
      canForceDelete,
      permanentBlockers,
      removableDependencies,
      forceDeleteActions: canForceDelete
        ? [
            'Remove outlet product assignments',
            'Remove outlet stock records',
            'Remove outlet users and carts',
            'Permanently delete the outlet',
          ]
        : undefined,
    };
  }

  async deleteOutlet(
    outletId: string,
    params: {
      adminId: string;
      force?: boolean;
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<{ id: string }> {
    const outlet = await this.getById(outletId);
    const analysis = await this.analyzeOutletDelete(outletId);

    if (!analysis.canDelete && !params.force) {
      if (analysis.canForceDelete) {
        throw new ValidationError(
          DELETE_ERROR_CODES.REQUIRES_FORCE,
          `This outlet is referenced by ${analysis.removableDependencies
            .map((item) => `${item.count} ${item.label.toLowerCase()}`)
            .join(' and ')}.`,
          { deleteAnalysis: analysis },
        );
      }

      throw new ValidationError(
        DELETE_ERROR_CODES.BLOCKED,
        this.buildPermanentOutletDeleteMessage(analysis),
        { deleteAnalysis: analysis },
      );
    }

    if (params.force && analysis.permanentBlockers.length > 0) {
      throw new ValidationError(
        DELETE_ERROR_CODES.BLOCKED,
        this.buildPermanentOutletDeleteMessage(analysis),
        { deleteAnalysis: analysis },
      );
    }

    await this.prisma.$transaction(async (tx) => {
      if (params.force) {
        await this.outletRepo.deleteRemovableOutletDependencies(outletId, tx);
      }

      await this.outletRepo.hardDelete(outletId, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_DISABLED,
          metadata: { outletId, deleted: true },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    return { id: outlet.id };
  }

  private buildPermanentOutletDeleteMessage(
    analysis: DeleteAnalysis,
  ): string {
    if (analysis.permanentBlockers.length === 0) {
      return 'Cannot delete this outlet.';
    }

    const details = analysis.permanentBlockers
      .map((blocker) => `${blocker.count} ${blocker.label}`)
      .join(', ');

    return `Cannot delete this outlet because it has permanent business records: ${details}. Those records must be retained.`;
  }
}
