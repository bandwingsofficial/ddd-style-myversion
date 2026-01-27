/* ================================================= */
/* ITEM DTO (same naming as cart)                    */
/* ================================================= */

export class CheckoutSummaryItemResponseDto {
  productId: string;

  productName: string;
  productImage: string;

  quantity: number;

  unitPrice: number;
  discountPrice?: number;

  lineTotal: number; // ✅ same as cart
}

/* ================================================= */
/* ADDRESS DTO                                       */
/* ================================================= */

export class CheckoutSummaryAddressResponseDto {
  id: string;

  label: string;
  addressText: string;

  latitude?: number;
  longitude?: number;
}

/* ================================================= */
/* SUMMARY RESPONSE DTO (EXACT cart naming)           */
/* ================================================= */

export class CheckoutSummaryResponseDto {
  address: CheckoutSummaryAddressResponseDto;

  items: CheckoutSummaryItemResponseDto[];

  /* ✅ identical to Cart fields */
  subtotal: number;
  discount: number;
  afterDiscountTotal: number;

  deliveryFee: number;
  grandTotal: number;

  itemCount: number;

  currency: string;
}
