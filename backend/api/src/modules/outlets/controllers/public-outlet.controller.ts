// src/modules/outlets/controllers/public-outlet.controller.ts

import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import { OutletOrchestratorService } from '../services/outlet-orchestrator.service';

@Controller('public/outlets')
export class PublicOutletController {
  constructor(
    private readonly orchestrator: OutletOrchestratorService,
  ) {}

  /* ================================================= */
  /* PUBLIC – LIST NEARBY OUTLETS ⭐ UPDATED             */
  /* ================================================= */

  @Get()
  async getPublicOutlets(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    let outlets;

    /* ------------------------------------------------ */
    /* IF LAT/LNG PROVIDED → NEARBY ONLY                */
    /* ------------------------------------------------ */

    if (lat !== undefined && lng !== undefined) {
      const latitude = Number(lat);
      const longitude = Number(lng);

      // ✅ SAFETY (important)
      if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
        outlets = await this.orchestrator.getNearbyOutlets(
          latitude,
          longitude,
        );
      }
    }

    /* ------------------------------------------------ */
    /* FALLBACK → ALL                                   */
    /* ------------------------------------------------ */

    if (!outlets) {
      outlets = await this.orchestrator.getAllOutlets();
    }

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
  /* PUBLIC – OUTLET PRODUCTS (specific FIRST)         */
  /* ================================================= */

 /* ================================================= */
/* PUBLIC – OUTLET PRODUCTS (specific FIRST)          */
/* ================================================= */

@Get(':outletId/products')
async getOutletProducts(
  @Param('outletId') outletId: string,
) {
  console.log('🟡 PRODUCTS API HIT → outletId =', outletId);

  const outlet =
    await this.orchestrator.getOutletById(outletId);

  if (!outlet) {
    console.log('❌ Outlet NOT FOUND');
  }

  if (!outlet?.isPubliclyVisible()) {
    console.log('❌ Outlet not publicly visible');
  }

  if (!outlet || !outlet.isPubliclyVisible()) {
    return {
      success: false,
      code: 'OUTLET_NOT_AVAILABLE',
      message: 'Outlet not available',
      data: null,
    };
  }

  console.log('✅ Outlet OK → fetching products...');

  const rows =
    await this.orchestrator.getAvailableOutletProductsWithDetails(
      outletId,
    );

  console.log(
    '📦 DB rows returned =',
    rows.length,
  );

  const data = rows.map((r) => ({
    id: r.product.id,
    name: r.product.productName,
    slug: r.product.slug,

    price:
      r.discountOverride ??
      r.priceOverride ??
      r.product.discountPrice ??
      r.product.originalPrice,

    image: r.product.mainImage ?? null,
    galleryImages:
      r.product.galleryImages?.map((g) => g.imageUrl) ?? [],

    shortDescription: r.product.shortDescription,
    longDescription: r.product.longDescription,

    tags: r.product.tags ?? [],
    isTrending: r.product.isTrending,
    ratingAverage: r.product.ratingAverage,
    ratingCount: r.product.ratingCount,

    unitValue: r.product.unitValue,
    unitType: r.product.unitType,

    available: r.isAvailable,
  }));

  console.log(
    '📤 Sending products to client =',
    data.length,
  );

  return {
    success: true,
    code: 'PUBLIC_OUTLET_PRODUCTS_FETCHED',
    message: 'Products fetched successfully',
    data,
  };
}


  /* ================================================= */
  /* PUBLIC – OUTLET DETAILS (generic LAST)            */
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
