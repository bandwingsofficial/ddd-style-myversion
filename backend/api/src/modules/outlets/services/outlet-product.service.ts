// src/modules/outlets/services/outlet-product.service.ts

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

import { OutletProduct } from '../domain/models/outlet-product.model';
import { OutletRepository } from '../repositories/outlet.repository';
import { OutletProductRepository } from '../repositories/outlet-product.repository';

import { AuditLogRepository } from '../../auth/repositories/audit-log.repository';
import { ActorType } from '../../auth/domain/enums/actor-type.enum';
import { AuditAction } from '../../auth/domain/enums/audit-action.enum';

import { ValidationError } from '../../../common/errors';

@Injectable()
export class OutletProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outletRepo: OutletRepository,
    private readonly repo: OutletProductRepository,
    private readonly auditRepo: AuditLogRepository,
  ) {}

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  async getProducts(outletId: string): Promise<OutletProduct[]> {
    return this.repo.findByOutlet(outletId);
  }

  async getAvailableProducts(outletId: string): Promise<OutletProduct[]> {
    return this.repo.findAvailableByOutlet(outletId);
  }

  /**
   * 🔥 NEW — used by PUBLIC API
   * returns joined product details
   */
  async getAvailableProductsWithDetails(outletId: string) {
    return this.repo.findAvailableWithProduct(outletId);
  }

  /* ================================================= */
  /* ASSIGN PRODUCT TO OUTLET                          */
  /* ================================================= */

  async assignProduct(params: {
    outletId: string;
    productId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<OutletProduct> {
    const outlet = await this.outletRepo.findById(params.outletId);

    if (!outlet) {
      throw new ValidationError('OUTLET_NOT_FOUND', 'Outlet not found');
    }

    // ✅ prevent duplicate assignment
    const existing = await this.repo.findOne(
      params.outletId,
      params.productId,
    );

    if (existing) return existing;

    const entity = OutletProduct.createNew({
      outletId: params.outletId,
      productId: params.productId,
    });

    let created!: OutletProduct;

    await this.prisma.$transaction(async (tx) => {
      created = await this.repo.create(entity, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_UPDATED,
          metadata: {
            type: 'OUTLET_PRODUCT',
            outletId: params.outletId,
            productId: params.productId,
            action: 'ASSIGNED',
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
  /* TOGGLE AVAILABILITY                               */
  /* ================================================= */

  async enableProduct(params: {
    outletId: string;
    productId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const entity = await this.getExisting(params);

    await this.persistAvailability(
      entity.enable(),
      params,
      'ENABLED',
    );
  }

  async disableProduct(params: {
    outletId: string;
    productId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const entity = await this.getExisting(params);

    await this.persistAvailability(
      entity.disable(),
      params,
      'DISABLED',
    );
  }

  /* ================================================= */
  /* PRICING                                           */
  /* ================================================= */

  async updatePricing(params: {
    outletId: string;
    productId: string;
    priceOverride?: number | null;
    discountOverride?: number | null;
    adminId: string;
  }): Promise<OutletProduct> {
    const existing = await this.getExisting(params);

    const updated = existing.updatePricing({
      priceOverride: params.priceOverride,
      discountOverride: params.discountOverride,
    });

    return this.repo.updatePricing(updated);
  }

  /* ================================================= */
  /* REMOVE PRODUCT                                    */
  /* ================================================= */

  async removeProduct(params: {
    outletId: string;
    productId: string;
    adminId: string;
  }): Promise<void> {
    await this.repo.delete(params.outletId, params.productId);
  }

  /* ================================================= */
  /* PRIVATE HELPERS                                   */
  /* ================================================= */

  private async getExisting(params: {
    outletId: string;
    productId: string;
  }): Promise<OutletProduct> {
    const entity = await this.repo.findOne(
      params.outletId,
      params.productId,
    );

    if (!entity) {
      throw new ValidationError(
        'OUTLET_PRODUCT_NOT_FOUND',
        'Product not assigned to outlet',
      );
    }

    return entity;
  }

  private async persistAvailability(
    entity: OutletProduct,
    params: {
      outletId: string;
      productId: string;
      adminId: string;
      ipAddress?: string;
      userAgent?: string;
    },
    actionLabel: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await this.repo.updateAvailability(entity, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_UPDATED,
          metadata: {
            type: 'OUTLET_PRODUCT',
            outletId: params.outletId,
            productId: params.productId,
            action: actionLabel,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });
  }
}
