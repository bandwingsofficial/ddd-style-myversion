import { ProductListItem, ProductImages } from "@/features/products/types/product.types";
import { parsePriceValue, resolveProductPricing } from "@/lib/product-pricing";

function normalizeProductImages(raw: unknown): ProductImages | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  const img = raw as Record<string, unknown>;
  const mainImageUrl =
    (typeof img.mainImageUrl === "string" && img.mainImageUrl.trim()) ||
    (typeof img.mainImage === "string" && img.mainImage.trim()) ||
    null;

  if (!mainImageUrl) return undefined;

  const gallerySource = Array.isArray(img.galleryImageUrls)
    ? img.galleryImageUrls
    : Array.isArray(img.galleryImages)
      ? img.galleryImages
      : [];

  return {
    mainImageUrl,
    galleryImageUrls: gallerySource.filter(
      (entry): entry is string => typeof entry === "string" && entry.trim() !== "",
    ),
  };
}

/** Normalize outlet / list API payloads to the same shape as Product Details. */
export function normalizeProductListItem(
  raw: Record<string, unknown>,
  catalogItem?: ProductListItem | null,
): ProductListItem {
  const item = raw as Record<string, any>;

  const effectivePrice = parsePriceValue(
    typeof item.price === "number" || typeof item.price === "string"
      ? item.price
      : (item.price?.discountPrice ??
          item.price?.originalPrice ??
          item.price?.value),
  );

  let price: { originalPrice: number; discountPrice?: number | null };

  if (
    item.price &&
    typeof item.price === "object" &&
    item.price.originalPrice !== undefined
  ) {
    price = {
      originalPrice: parsePriceValue(item.price.originalPrice),
      discountPrice:
        item.price.discountPrice != null
          ? parsePriceValue(item.price.discountPrice)
          : null,
    };
  } else if (catalogItem) {
    const catalogPricing = resolveProductPricing(
      catalogItem as unknown as Record<string, unknown>,
    );
    const mrp = catalogPricing.mrp;
    const hasDiscount = effectivePrice > 0 && effectivePrice < mrp;
    price = {
      originalPrice: mrp,
      discountPrice: hasDiscount
        ? effectivePrice
        : catalogPricing.hasDiscount
          ? catalogPricing.sellingPrice
          : null,
    };
  } else {
    price = { originalPrice: effectivePrice, discountPrice: null };
  }

  return {
    id: item.id,
    name: item.name?.value ?? item.name,
    slug: item.slug?.value ?? item.slug,
    price,
    images:
      normalizeProductImages(item.images) ??
      catalogItem?.images,
    unit:
      item.unit ??
      (item.unitValue != null
        ? { value: item.unitValue, type: item.unitType }
        : undefined),
    tags: item.tags ?? [],
    trendState: item.trendState ?? { trending: !!item.isTrending },
    rating:
      item.rating ??
      (item.ratingAverage != null
        ? { average: item.ratingAverage, count: item.ratingCount ?? 0 }
        : undefined),
    category: item.category ?? catalogItem?.category,
    shortDescription: item.shortDescription ?? undefined,
    outletId: item.outletId,
  } as ProductListItem;
}

export function normalizeProductList(
  items: Record<string, unknown>[],
  catalog: ProductListItem[] = [],
): ProductListItem[] {
  const catalogById = new Map(catalog.map((p) => [p.id, p]));
  return items.map((item) =>
    normalizeProductListItem(item, catalogById.get(String(item.id))),
  );
}
