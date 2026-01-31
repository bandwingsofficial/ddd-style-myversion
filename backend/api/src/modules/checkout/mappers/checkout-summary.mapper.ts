// src/modules/checkout/mappers/checkout-summary.mapper.ts

import { Cart } from '../../cart/domain/models/cart.model';
import { SavedAddress } from '../../saved-address/domain/models/saved-address.model';
import { Decimal } from '@prisma/client/runtime/library';

/* ---------------------------------------------- */
/* HELPERS                                        */
/* ---------------------------------------------- */

const toNumber = (d?: Decimal | null): number =>
  d == null ? 0 : Number(d);

/* ---------------------------------------------- */
/* DTOs (✅ SAME NAMES AS CART)                    */
/* ---------------------------------------------- */

export interface CheckoutSummaryItemDto {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;

  unitPrice: number;
  discountPrice?: number;

  lineTotal: number; // ← match cart naming
}

export interface CheckoutSummaryDto {
  address: {
    id: string;
    label: string;
    addressText: string;
    latitude?: number;
    longitude?: number;
  };

  /* ✅ EXACT SAME FIELDS AS CART */
  items: CheckoutSummaryItemDto[];

  /* ✅ EXACT SAME FIELDS AS CART */
  subtotal: number;
  discount: number;
  afterDiscountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  itemCount: number;

  currency: string;
}

/* ---------------------------------------------- */
/* MAPPER                                         */
/* ---------------------------------------------- */

export class CheckoutSummaryMapper {
  static toDto(params: {
    cart: Cart;
    address: SavedAddress;
  }): CheckoutSummaryDto {
    const { cart, address } = params;

    /* ---------------- items snapshot ---------------- */

    const items: CheckoutSummaryItemDto[] = cart.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,

      unitPrice: toNumber(item.unitPrice),

      discountPrice:
        item.discountPrice != null
          ? toNumber(item.discountPrice)
          : undefined,

      // ✅ same as cart
      lineTotal: toNumber(item.getLineTotal()),
    }));

    /* ---------------- totals snapshot ---------------- */
    /* ZERO recalculation. Just copy. */

    return {
      address: {
        id: address.id,
        label: address.label,
        addressText: address.addressText,
        latitude: address.latitude ?? undefined,
        longitude: address.longitude ?? undefined,
      },

      items,

      subtotal: toNumber(cart.subtotal),
      discount: toNumber(cart.discount),
      afterDiscountTotal: toNumber(cart.afterDiscountTotal),
      deliveryFee: toNumber(cart.deliveryFee),
      grandTotal: toNumber(cart.grandTotal),
      itemCount: cart.itemCount,

      currency: cart.currency,
    };
  }
}
