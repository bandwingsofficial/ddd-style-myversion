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
/* Snapshot only — NO calculations                   */
/* ================================================= */

@Injectable()
export class CheckoutPricingService {
  calculate(params: {
    cart: Cart;
    deliveryFee?: number;
  }): CheckoutPricingResult {

    const { cart } = params;

    /* ---------------------------------- */
    /* PURE SNAPSHOT COPY (NO MATH EVER)  */
    /* ---------------------------------- */

    const deliveryFee =
      params.deliveryFee !== undefined
        ? Math.max(0, params.deliveryFee)
        : toNumber(cart.deliveryFee);

    return {
      subtotal: toNumber(cart.subtotal),
      discount: toNumber(cart.discount),
      afterDiscountTotal: toNumber(cart.afterDiscountTotal),

      deliveryFee,

      // ✅ ALWAYS trust cart snapshot
      grandTotal:
        deliveryFee === toNumber(cart.deliveryFee)
          ? toNumber(cart.grandTotal)
          : toNumber(cart.afterDiscountTotal) + deliveryFee,
    };
  }
}
