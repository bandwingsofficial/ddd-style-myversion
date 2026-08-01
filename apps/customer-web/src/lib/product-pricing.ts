export interface ProductPricing {
  mrp: number;
  sellingPrice: number;
  hasDiscount: boolean;
  savings: number;
  discountPercent: number;
}

export function parsePriceValue(val: unknown): number {
  if (val === undefined || val === null) return 0;
  const num = parseFloat(String(val));
  return Number.isNaN(num) ? 0 : num;
}

/** Shared MRP / selling price / discount logic for product list & detail views. */
export function resolveProductPricing(
  product: Record<string, unknown>,
): ProductPricing {
  const p = product as Record<string, any>;
  const mrp = parsePriceValue(
    p.originalPrice ?? p.price?.originalPrice ?? p.price?.value ?? p.price,
  );
  const discountVal = parsePriceValue(
    p.discountPrice ??
      p.salePrice ??
      p.price?.discountPrice ??
      p.price?.salePrice,
  );

  const hasDiscount = discountVal > 0 && discountVal < mrp;
  const sellingPrice = hasDiscount ? discountVal : mrp;
  const savings = mrp - sellingPrice;
  const discountPercent =
    hasDiscount && mrp > 0 ? Math.round((savings / mrp) * 100) : 0;

  return {
    mrp,
    sellingPrice,
    hasDiscount,
    savings,
    discountPercent,
  };
}
