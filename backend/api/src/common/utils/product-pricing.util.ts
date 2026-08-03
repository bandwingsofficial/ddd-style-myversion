import { Decimal } from '@prisma/client/runtime/library';

export type DecimalInput = Decimal | string | number;

export function toPricingDecimal(value: DecimalInput): Decimal {
  return value instanceof Decimal ? value : new Decimal(value);
}

/* ================================================= */
/* DISCOUNT + EFFECTIVE PRICE (single rule)          */
/* ================================================= */

/**
 * Number variant — used by ProductPrice, OrderItem (Money layer).
 * Rule: discount > 0 AND discount < originalPrice.
 */
export function normalizeDiscountPriceNumber(
  originalPrice: number,
  discountPrice?: number | null,
): number | undefined {
  if (discountPrice == null || discountPrice <= 0) {
    return undefined;
  }

  if (discountPrice >= originalPrice) {
    return undefined;
  }

  return discountPrice;
}

export function resolveEffectivePriceNumber(
  originalPrice: number,
  discountPrice?: number | null,
): number {
  return normalizeDiscountPriceNumber(originalPrice, discountPrice) ?? originalPrice;
}

export function computeLineTotalNumber(
  originalPrice: number,
  discountPrice: number | null | undefined,
  quantity: number,
): number {
  return resolveEffectivePriceNumber(originalPrice, discountPrice) * quantity;
}

/**
 * Decimal variant — used by CartItem snapshots and cart totals.
 * Rule: discount > 0 AND discount < originalPrice.
 */
export function normalizeDiscountPrice(
  originalPrice: Decimal,
  discountPrice?: Decimal | null,
): Decimal | undefined {
  if (discountPrice == null) {
    return undefined;
  }

  if (discountPrice.lessThanOrEqualTo(0)) {
    return undefined;
  }

  if (discountPrice.greaterThanOrEqualTo(originalPrice)) {
    return undefined;
  }

  return discountPrice;
}

export function resolveEffectivePrice(
  originalPrice: Decimal,
  discountPrice?: Decimal | null,
): Decimal {
  return normalizeDiscountPrice(originalPrice, discountPrice) ?? originalPrice;
}

export function computeLineTotal(
  originalPrice: Decimal,
  discountPrice: Decimal | null | undefined,
  quantity: number,
): Decimal {
  return resolveEffectivePrice(originalPrice, discountPrice).mul(
    new Decimal(quantity),
  );
}

/* ================================================= */
/* OUTLET + PRODUCT RESOLUTION                       */
/* Priority:                                         */
/*   outletDiscountOverride                          */
/*   → outletPriceOverride                           */
/*   → productDiscountPrice                          */
/*   → productOriginalPrice                          */
/* ================================================= */

export interface ResolvedCartItemPricing {
  unitPrice: Decimal;
  discountPrice?: Decimal;
  effectivePrice: Decimal;
}

export function resolveCartItemPricingFromSources(params: {
  productOriginalPrice: DecimalInput;
  productDiscountPrice?: DecimalInput | null;
  outletPriceOverride?: DecimalInput | null;
  outletDiscountOverride?: DecimalInput | null;
}): ResolvedCartItemPricing {
  const catalogOriginal = toPricingDecimal(params.productOriginalPrice);
  const catalogDiscount = normalizeDiscountPrice(
    catalogOriginal,
    params.productDiscountPrice != null
      ? toPricingDecimal(params.productDiscountPrice)
      : null,
  );

  const outletEffectiveRaw =
    params.outletDiscountOverride ?? params.outletPriceOverride ?? null;

  if (outletEffectiveRaw != null) {
    const outletEffective = toPricingDecimal(outletEffectiveRaw);

    if (outletEffective.lessThan(catalogOriginal)) {
      const discount = normalizeDiscountPrice(catalogOriginal, outletEffective);
      const effectivePrice = discount ?? catalogOriginal;

      return {
        unitPrice: catalogOriginal,
        discountPrice: discount,
        effectivePrice,
      };
    }

    return {
      unitPrice: outletEffective,
      discountPrice: undefined,
      effectivePrice: outletEffective,
    };
  }

  const effectivePrice = resolveEffectivePrice(catalogOriginal, catalogDiscount);

  return {
    unitPrice: catalogOriginal,
    discountPrice: catalogDiscount,
    effectivePrice,
  };
}

/**
 * Public outlet listing — single effective selling price for display.
 * Same precedence as cart resolution.
 */
export function resolvePublicOutletEffectivePrice(params: {
  productOriginalPrice: DecimalInput;
  productDiscountPrice?: DecimalInput | null;
  outletPriceOverride?: DecimalInput | null;
  outletDiscountOverride?: DecimalInput | null;
}): Decimal {
  return resolveCartItemPricingFromSources(params).effectivePrice;
}

/* ================================================= */
/* CART TOTALS                                       */
/* ================================================= */

export interface CartLineInput {
  unitPrice: Decimal;
  discountPrice?: Decimal | null;
  quantity: number;
}

export interface CartItemTotalsResult {
  subtotal: Decimal;
  discount: Decimal;
  afterDiscountTotal: Decimal;
  itemCount: number;
}

/**
 * Aggregate item-level totals for a cart.
 * subtotal = Σ(originalPrice × qty)
 * afterDiscountTotal = Σ(effectivePrice × qty)
 * discount = subtotal − afterDiscountTotal
 */
export function computeCartItemTotals(items: CartLineInput[]): CartItemTotalsResult {
  let subtotal = new Decimal(0);
  let afterDiscountTotal = new Decimal(0);
  let itemCount = 0;

  for (const item of items) {
    const normalizedDiscount = normalizeDiscountPrice(
      item.unitPrice,
      item.discountPrice,
    );
    const lineOriginal = item.unitPrice.mul(item.quantity);
    const linePayable = computeLineTotal(
      item.unitPrice,
      normalizedDiscount,
      item.quantity,
    );

    subtotal = subtotal.add(lineOriginal);
    afterDiscountTotal = afterDiscountTotal.add(linePayable);
    itemCount += item.quantity;
  }

  return {
    subtotal,
    discount: subtotal.sub(afterDiscountTotal),
    afterDiscountTotal,
    itemCount,
  };
}

export interface CartGrandTotalInput extends CartItemTotalsResult {
  deliveryFee: DecimalInput;
}

export interface CartGrandTotalResult extends CartItemTotalsResult {
  deliveryFee: Decimal;
  grandTotal: Decimal;
}

export function computeCartGrandTotal(
  items: CartLineInput[],
  deliveryFee: DecimalInput,
): CartGrandTotalResult {
  const itemTotals = computeCartItemTotals(items);
  const fee = toPricingDecimal(deliveryFee);

  return {
    ...itemTotals,
    deliveryFee: fee,
    grandTotal: itemTotals.afterDiscountTotal.add(fee),
  };
}

/* ================================================= */
/* LEGACY REPAIR DETECTION                           */
/* ================================================= */

export interface PersistedCartItemRow {
  unitPrice: Decimal;
  discountPrice?: Decimal | null;
  quantity: number;
  lineTotal: Decimal;
}

export function cartItemRowNeedsRepair(
  row: PersistedCartItemRow,
): boolean {
  const normalizedDiscount = normalizeDiscountPrice(
    row.unitPrice,
    row.discountPrice,
  );
  const expectedLineTotal = computeLineTotal(
    row.unitPrice,
    normalizedDiscount,
    row.quantity,
  );

  const discountMatches =
    (row.discountPrice?.toString() ?? null) ===
    (normalizedDiscount?.toString() ?? null);

  return !row.lineTotal.equals(expectedLineTotal) || !discountMatches;
}

export function repairPersistedCartItemRow(
  row: PersistedCartItemRow,
): {
  unitPrice: Decimal;
  discountPrice?: Decimal;
  lineTotal: Decimal;
} {
  const normalizedDiscount = normalizeDiscountPrice(
    row.unitPrice,
    row.discountPrice,
  );

  return {
    unitPrice: row.unitPrice,
    discountPrice: normalizedDiscount,
    lineTotal: computeLineTotal(row.unitPrice, normalizedDiscount, row.quantity),
  };
}

/* ================================================= */
/* ORDER SNAPSHOT (number / Money bridge)            */
/* ================================================= */

export interface OrderLineSnapshotInput {
  unitPrice: number;
  discountPrice?: number | null;
  quantity: number;
}

export function computeOrderLineTotal(input: OrderLineSnapshotInput): number {
  return computeLineTotalNumber(
    input.unitPrice,
    input.discountPrice,
    input.quantity,
  );
}

export interface OrderItemTotalsResult {
  subtotal: number;
  discount: number;
  afterDiscountTotal: number;
  itemCount: number;
}

export function computeOrderItemTotals(
  items: OrderLineSnapshotInput[],
): OrderItemTotalsResult {
  let subtotal = 0;
  let afterDiscountTotal = 0;
  let itemCount = 0;

  for (const item of items) {
    subtotal += item.unitPrice * item.quantity;
    afterDiscountTotal += computeOrderLineTotal(item);
    itemCount += item.quantity;
  }

  return {
    subtotal,
    discount: subtotal - afterDiscountTotal,
    afterDiscountTotal,
    itemCount,
  };
}
