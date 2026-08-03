import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaTransaction } from '../../infrastructure/prisma/prisma.types';
import {
  resolveCartItemPricingFromSources,
  resolvePublicOutletEffectivePrice,
} from '../utils/product-pricing.util';

/**
 * Injectable accessor for outlet-aware pricing resolution.
 * All cart/checkout/order code must use this or the underlying util — never inline math.
 */
@Injectable()
export class PricingEngineService {
  resolveCartItemPricing(params: {
    productOriginalPrice: Prisma.Decimal;
    productDiscountPrice: Prisma.Decimal | null;
    outletPriceOverride?: Prisma.Decimal | null;
    outletDiscountOverride?: Prisma.Decimal | null;
  }) {
    return resolveCartItemPricingFromSources({
      productOriginalPrice: params.productOriginalPrice,
      productDiscountPrice: params.productDiscountPrice,
      outletPriceOverride: params.outletPriceOverride ?? null,
      outletDiscountOverride: params.outletDiscountOverride ?? null,
    });
  }

  resolvePublicOutletPrice(params: {
    productOriginalPrice: Prisma.Decimal;
    productDiscountPrice: Prisma.Decimal | null;
    outletPriceOverride?: Prisma.Decimal | null;
    outletDiscountOverride?: Prisma.Decimal | null;
  }): Prisma.Decimal {
    return resolvePublicOutletEffectivePrice({
      productOriginalPrice: params.productOriginalPrice,
      productDiscountPrice: params.productDiscountPrice,
      outletPriceOverride: params.outletPriceOverride ?? null,
      outletDiscountOverride: params.outletDiscountOverride ?? null,
    });
  }

  async resolveCartItemPricingForProduct(
    product: {
      id: string;
      originalPrice: Prisma.Decimal;
      discountPrice: Prisma.Decimal | null;
    },
    outletId: string,
    tx: PrismaTransaction,
  ) {
    const outletProduct = await tx.outletProduct.findUnique({
      where: {
        outletId_productId: {
          outletId,
          productId: product.id,
        },
      },
      select: {
        priceOverride: true,
        discountOverride: true,
      },
    });

    return this.resolveCartItemPricing({
      productOriginalPrice: product.originalPrice,
      productDiscountPrice: product.discountPrice,
      outletPriceOverride: outletProduct?.priceOverride ?? null,
      outletDiscountOverride: outletProduct?.discountOverride ?? null,
    });
  }
}
