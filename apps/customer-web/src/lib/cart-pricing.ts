import { parsePriceValue } from "./product-pricing";

/**
 * Mirrors backend resolveEffectivePriceNumber:
 * discount applies only when 0 < discount < original.
 */
export function resolveEffectivePrice(
  originalPrice: number,
  discountPrice?: number | null,
): number {
  const original = parsePriceValue(originalPrice);
  const discount = parsePriceValue(discountPrice);

  if (discount > 0 && discount < original) {
    return discount;
  }

  return original;
}

export function computeLineTotal(
  originalPrice: number,
  discountPrice: number | null | undefined,
  quantity: number,
): number {
  const qty = Math.max(0, parsePriceValue(quantity));
  return resolveEffectivePrice(originalPrice, discountPrice) * qty;
}

export function formatRupee(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `₹${safe.toFixed(safe % 1 === 0 ? 0 : 2)}`;
}

export interface NormalizedCartItemPricing {
  unitPrice: number;
  discountPrice: number;
  quantity: number;
  lineTotal: number;
}

/** Normalize API cart item fields into a consistent pricing snapshot. */
export function normalizeCartItemPricing(item: {
  unitPrice?: unknown;
  discountPrice?: unknown;
  effectivePrice?: unknown;
  quantity?: unknown;
  lineTotal?: unknown;
}): NormalizedCartItemPricing {
  const unitPrice = parsePriceValue(item.unitPrice);
  const quantity = Math.max(1, parsePriceValue(item.quantity) || 1);

  const rawDiscount =
    item.discountPrice != null ? parsePriceValue(item.discountPrice) : null;
  const effectiveFromApi =
    item.effectivePrice != null ? parsePriceValue(item.effectivePrice) : null;
  const lineTotalFromApi =
    item.lineTotal != null ? parsePriceValue(item.lineTotal) : null;

  const effectivePrice =
    effectiveFromApi ??
    (lineTotalFromApi != null && quantity > 0
      ? lineTotalFromApi / quantity
      : resolveEffectivePrice(unitPrice, rawDiscount));

  const lineTotal =
    lineTotalFromApi ?? computeLineTotal(unitPrice, rawDiscount, quantity);

  return {
    unitPrice,
    discountPrice: effectivePrice,
    quantity,
    lineTotal,
  };
}
