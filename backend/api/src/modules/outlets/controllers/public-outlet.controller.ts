// src/modules/outlets/controllers/public-outlet.controller.ts

import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { OutletOrchestratorService } from '../services/outlet-orchestrator.service';

@Controller('public/outlets')
export class PublicOutletController {
  constructor(
    private readonly orchestrator: OutletOrchestratorService,
  ) {}

  /* ================================================= */
  /* PUBLIC – LIST OUTLETS                              */
  /* ================================================= */

  @Get()
  async getPublicOutlets() {
    const outlets = await this.orchestrator.getAllOutlets();

    const data = outlets.filter((o) =>
      o.isPubliclyVisible(),
    );

    return {
      success: true,
      code: 'PUBLIC_OUTLETS_FETCHED',
      message: 'Outlets fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* PUBLIC – OUTLET PRODUCTS (🔥 specific FIRST)       */
  /* ================================================= */

  // 🔥 MUST be before ":outletId"
  @Get(':outletId/products')
  async getOutletProducts(
    @Param('outletId') outletId: string,
  ) {
    const outlet =
      await this.orchestrator.getOutletById(outletId);

    // 🔥 defensive check
    if (!outlet || !outlet.isPubliclyVisible()) {
      return {
        success: false,
        code: 'OUTLET_NOT_AVAILABLE',
        message: 'Outlet not available',
        data: null,
      };
    }

    const rows =
      await this.orchestrator.getAvailableOutletProductsWithDetails(
        outletId,
      );

    const data = rows.map((r) => ({
      /* CORE */
      id: r.product.id,
      name: r.product.productName,
      slug: r.product.slug,

      /* PRICING */
      price:
        r.discountOverride ??
        r.priceOverride ??
        r.product.discountPrice ??
        r.product.originalPrice,

      /* IMAGES */
      image: r.product.mainImage ?? null,
      galleryImages:
        r.product.galleryImages?.map((g) => g.imageUrl) ?? [],

      /* DESCRIPTION */
      shortDescription: r.product.shortDescription,
      longDescription: r.product.longDescription,

      /* META */
      tags: r.product.tags ?? [],
      isTrending: r.product.isTrending,
      ratingAverage: r.product.ratingAverage,
      ratingCount: r.product.ratingCount,

      /* UNIT */
      unitValue: r.product.unitValue,
      unitType: r.product.unitType,

      /* OUTLET STATE */
      available: r.isAvailable,
    }));

    return {
      success: true,
      code: 'PUBLIC_OUTLET_PRODUCTS_FETCHED',
      message: 'Products fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* PUBLIC – OUTLET DETAILS (🔥 generic LAST)          */
  /* ================================================= */

  @Get(':outletId')
  async getOutletDetails(
    @Param('outletId') outletId: string,
  ) {
    const outlet =
      await this.orchestrator.getOutletById(outletId);

    if (!outlet || !outlet.isPubliclyVisible()) {
      return {
        success: false,
        code: 'OUTLET_NOT_AVAILABLE',
        message: 'Outlet not available',
        data: null,
      };
    }

    return {
      success: true,
      code: 'PUBLIC_OUTLET_FETCHED',
      message: 'Outlet details fetched successfully',
      data: outlet,
    };
  }
}
