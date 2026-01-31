import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

import { Cart } from '../../cart/domain/models/cart.model';

/* ================================================= */
/* HELPERS                                           */
/* ================================================= */

const toNumber = (d?: Decimal | null): number =>
  d == null ? 0 : Number(d);

/* ================================================= */
/* TYPES                                             */
/* ================================================= */

export interface CheckoutPricingResult {
  subtotal: number;
  discount: number;
  afterDiscountTotal: number;
  deliveryFee: number;
  grandTotal: number;
}

/* ================================================= */
/* PRICING SERVICE                                   */
/* PURE SNAPSHOT ONLY (NO CALCULATIONS EVER)          */
/* ================================================= */

@Injectable()
export class CheckoutPricingService {
  /**
   * Copies already-calculated totals from Cart.
   *
   * IMPORTANT:
   * - NO math
   * - NO overrides
   * - NO client inputs
   * - Cart is the single source of truth
   */
  calculate(cart: Cart): CheckoutPricingResult {
    return {
      subtotal: toNumber(cart.subtotal),
      discount: toNumber(cart.discount),
      afterDiscountTotal: toNumber(cart.afterDiscountTotal),
      deliveryFee: toNumber(cart.deliveryFee),
      grandTotal: toNumber(cart.grandTotal),
    };
  }
}
