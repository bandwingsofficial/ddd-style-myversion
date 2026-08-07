// src/modules/outlets/controllers/public-outlet.controller.ts

import { Controller, Get, Param, Query, Logger } from '@nestjs/common';

import { OutletOrchestratorService } from '../services/outlet-orchestrator.service';
import { OutletResolutionService } from '../services/outlet-resolution.service';
import { ProductOrchestratorService } from '../../products/services/product-orchestrator.service';
import { PublicOutletMapper } from '../mappers/public-outlet.mapper';
import {
  assertValidCustomerCoordinates,
  validateCoordinateRange,
} from '../../../common/utils/geo-coordinate.validator';
import { ValidationError } from '../../../common/errors';
import { resolvePublicOutletEffectivePrice } from '../../../common/utils/product-pricing.util';

@Controller('public/outlets')
export class PublicOutletController {
  private readonly logger = new Logger(PublicOutletController.name);

  constructor(
    private readonly orchestrator: OutletOrchestratorService,
    private readonly outletResolution: OutletResolutionService,
    private readonly productOrchestrator: ProductOrchestratorService,
  ) {}

  /* ================================================= */
  /* PUBLIC – LIST NEARBY OUTLETS ⭐ UPDATED             */
  /* ================================================= */

  @Get()
  async getPublicOutlets(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    const latitude = Number(lat);
    const longitude = Number(lng);

    const hasValidCoords =
      lat !== undefined &&
      lng !== undefined &&
      validateCoordinateRange(latitude, longitude).valid;

    let data;

    if (hasValidCoords) {
      try {
        assertValidCustomerCoordinates(latitude, longitude);
      } catch {
        throw new ValidationError(
          'INVALID_COORDINATES',
          'Invalid location coordinates',
          { latitude, longitude },
        );
      }

      this.logger.log(
        JSON.stringify({
          event: 'public_outlets_search',
          latitude,
          longitude,
        }),
      );

      const results = await this.orchestrator.getNearbyPublicOutletBundles(
        latitude,
        longitude,
      );

      data = PublicOutletMapper.toDtoList(
        results.filter((r) => r.outlet.isPubliclyVisible()),
      );

      this.logger.log(
        JSON.stringify({
          event: 'public_outlets_search_result',
          latitude,
          longitude,
          matchedCount: data.length,
          outlets: data.map((outlet) => ({
            id: outlet.id,
            name: outlet.name,
            distanceKm: outlet.distanceKm,
            deliveryRadiusKm: outlet.deliveryRadiusKm,
          })),
        }),
      );
    } else {
      const bundles = await this.orchestrator.getAllPublicOutletBundles();

      data = bundles
        .filter((b) => b.outlet.isPubliclyVisible())
        .map((b) => PublicOutletMapper.toDto(b));
    }

    return {
      success: true,
      code: 'PUBLIC_OUTLETS_FETCHED',
      message: 'Outlets fetched successfully',
      data,
    };
  }

  /* ================================================= */
  /* PUBLIC – RESOLVE DELIVERY OUTLET (before :id)    */
  /* ================================================= */

  @Get('resolve')
  async resolveDeliveryOutlet(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (lat === undefined || lng === undefined) {
      throw new ValidationError(
        'COORDINATES_REQUIRED',
        'Latitude and longitude are required',
      );
    }

    try {
      assertValidCustomerCoordinates(latitude, longitude);
    } catch {
      throw new ValidationError(
        'INVALID_COORDINATES',
        'Invalid location coordinates',
        { latitude, longitude },
      );
    }

    this.logger.log(
      JSON.stringify({
        event: 'public_outlet_resolve',
        latitude,
        longitude,
      }),
    );

    const resolution = await this.outletResolution.resolveForCoordinates(
      latitude,
      longitude,
    );

    this.logger.log(
      JSON.stringify({
        event: 'public_outlet_resolve_result',
        latitude,
        longitude,
        status: resolution.status,
        resolvedOutletId: resolution.resolvedOutlet?.outletId ?? null,
        resolvedOutletName: resolution.resolvedOutlet?.outletName ?? null,
      }),
    );

    return {
      success: true,
      code:
        resolution.status === 'NO_SERVICE' ? 'NO_SERVICE' : 'OUTLET_RESOLVED',
      message:
        resolution.status === 'NO_SERVICE'
          ? 'No outlet serves this location.'
          : 'Outlet resolved successfully',
      data: resolution,
    };
  }

  /* ================================================= */
  /* PUBLIC – OUTLET PRODUCTS (specific FIRST)          */
  /* ================================================= */

  @Get(':outletId/products')
  async getOutletProducts(@Param('outletId') outletId: string) {
    console.log('🟡 PRODUCTS API HIT → outletId =', outletId);

    const outlet = await this.orchestrator.getOutletById(outletId);

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
      await this.orchestrator.getAvailableOutletProductsWithDetails(outletId);

    console.log('📦 DB rows returned =', rows.length);

    const data = await Promise.all(
      rows.map(async (r) => {
        const images = await this.productOrchestrator.resolvePublicImages({
          mainImage: r.product.mainImage,
          galleryImageKeys:
            r.product.galleryImages?.map((g) => g.imageUrl) ?? [],
        });

        return {
          id: r.product.id,
          name: r.product.productName,
          slug: r.product.slug,

          price: resolvePublicOutletEffectivePrice({
            productOriginalPrice: r.product.originalPrice,
            productDiscountPrice: r.product.discountPrice,
            outletPriceOverride: r.priceOverride,
            outletDiscountOverride: r.discountOverride,
          }),

          images,

          shortDescription: r.product.shortDescription,
          longDescription: r.product.longDescription,

          tags: r.product.tags ?? [],
          isTrending: r.product.isTrending,
          ratingAverage: r.product.ratingAverage,
          ratingCount: r.product.ratingCount,

          unitValue: r.product.unitValue,
          unitType: r.product.unitType,

          ingredients: r.product.ingredients,
          benefits: r.product.benefits,
          extraInfo1: r.product.extraInfo1,
          extraInfo2: r.product.extraInfo2,

          isFeatured: r.product.isFeatured,
          available: r.isAvailable,
          outletId: outlet.id,
          outletName: outlet.name,
        };
      }),
    );

    console.log('📤 Sending products to client =', data.length);

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
  async getOutletDetails(@Param('outletId') outletId: string) {
    const bundle = await this.orchestrator.getPublicOutletBundleById(outletId);

    if (!bundle || !bundle.outlet.isPubliclyVisible()) {
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
      data: PublicOutletMapper.toDto(bundle),
    };
  }
}
