import { ProductListItem } from "@/features/products/types/product.types";
import { resolveProductPricing } from "@/lib/product-pricing";

export interface ProductFilterCriteria {
  searchQuery?: string;
  categoryId?: string | null;
  selectedTags?: string[];
  maxPrice?: number;
}

export interface ProductPriceBounds {
  minPrice: number;
  maxProductPrice: number;
  sliderMax: number;
}

const PRICE_BUFFER = 300;

export function getProductName(product: ProductListItem): string {
  const name = product.name;
  if (typeof name === "string") return name;
  if (name && typeof name === "object" && "value" in name) {
    return String(name.value ?? "");
  }
  return "";
}

export function formatProductTagLabel(tag: string): string {
  return tag.replace(/_/g, " ");
}

function normalizeTagForComparison(tag: string): string {
  return tag.trim().toLowerCase();
}

export function extractUniqueProductTags(products: ProductListItem[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const product of products) {
    for (const tag of product.tags ?? []) {
      const normalized = normalizeTagForComparison(tag);
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      tags.push(tag);
    }
  }

  return tags.sort((a, b) =>
    formatProductTagLabel(a).localeCompare(formatProductTagLabel(b), undefined, {
      sensitivity: "base",
    }),
  );
}

function roundSliderMax(value: number): number {
  if (value <= 0) return PRICE_BUFFER;
  const step = value >= 1000 ? 100 : value >= 500 ? 50 : 10;
  return Math.ceil(value / step) * step;
}

export function computeProductPriceBounds(
  products: ProductListItem[],
): ProductPriceBounds {
  const validPrices = products
    .map((product) =>
      resolveProductPricing(product as unknown as Record<string, unknown>)
        .sellingPrice,
    )
    .filter((price) => Number.isFinite(price) && price >= 0);

  const minPrice = validPrices.length ? Math.min(...validPrices) : 0;
  const maxProductPrice = validPrices.length ? Math.max(...validPrices) : 0;
  const sliderMax = roundSliderMax(maxProductPrice + PRICE_BUFFER);

  return { minPrice, maxProductPrice, sliderMax };
}

export function filterProducts(
  products: ProductListItem[],
  criteria: ProductFilterCriteria,
): ProductListItem[] {
  const search = (criteria.searchQuery ?? "").trim().toLowerCase();
  const categoryId = criteria.categoryId ?? null;
  const selectedTags = criteria.selectedTags ?? [];
  const maxPrice = criteria.maxPrice;

  return products.filter((product) => {
    if (search && !getProductName(product).toLowerCase().includes(search)) {
      return false;
    }

    if (categoryId && product.category?.id !== categoryId) {
      return false;
    }

    if (selectedTags.length > 0) {
      const productTags = (product.tags ?? []).map(normalizeTagForComparison);
      const matchesTags = selectedTags.every((tag) =>
        productTags.includes(normalizeTagForComparison(tag)),
      );
      if (!matchesTags) return false;
    }

    if (maxPrice !== undefined) {
      const { sellingPrice } = resolveProductPricing(
        product as unknown as Record<string, unknown>,
      );
      if (sellingPrice > maxPrice) return false;
    }

    return true;
  });
}
