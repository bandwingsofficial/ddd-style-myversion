import customerAxios from "@/http/axios/customerAxios";
import { normalizeProductList } from "@/lib/product-normalizer";
import {
  ProductListItem,
  ProductDetails,
  ProductSlugPageResponse,
} from "../types/product.types";

let catalogCache: { data: ProductListItem[]; at: number } | null = null;
const CATALOG_CACHE_TTL_MS = 60_000;

export function invalidateProductCatalogCache(): void {
  catalogCache = null;
}

/** Clears product catalog cache when delivery location or outlet changes. */
export function invalidateOutletPipelineCache(): void {
  invalidateProductCatalogCache();
}

async function getPublicCatalog(): Promise<ProductListItem[]> {
  if (
    catalogCache &&
    Date.now() - catalogCache.at < CATALOG_CACHE_TTL_MS
  ) {
    return catalogCache.data;
  }

  const res = await customerAxios.get("/public/products");
  const data = Array.isArray(res.data.data) ? res.data.data : [];
  catalogCache = { data, at: Date.now() };
  return data;
}

/**
 * Fetch all public products
 */
export const getPublicProducts = async (): Promise<ProductListItem[]> => {
  const res = await customerAxios.get("/public/products");
  // Assuming backend returns { success: true, data: [...] }
  return res.data.data;
};

/**
 * Fetch product by slug
 * export const getProductBySlug = async (
  slug: string
): Promise<ProductDetails> => {
  const res = await customerAxios.get(`/public/products/slug/${slug}`);
  // Assuming backend returns { success: true, data: { ...object } }
  return res.data.data;
};
 */


export const getProductsByOutlet = async (outletId: string): Promise<ProductListItem[]> => {
  const [outletRes, catalog] = await Promise.all([
    customerAxios.get(`/public/outlets/${outletId}/products`),
    getPublicCatalog(),
  ]);

  const raw = Array.isArray(outletRes.data.data) ? outletRes.data.data : [];
  return normalizeProductList(raw, catalog);
};

/**
 * Fetch product by slug (remains mostly same, but might need outlet context in future)
 */
export const getProductBySlug = async (
  slug: string,
): Promise<ProductSlugPageResponse> => {
  const res = await customerAxios.get(`/public/products/slug/${slug}`);
  return res.data.data;
};