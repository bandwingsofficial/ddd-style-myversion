import customerAxios from "@/http/axios/customerAxios";
import { ProductListItem } from "@/features/products/types/product.types";

import {
  ProductSearchParams,
  ProductSearchResponse,
} from "./search.types";

const searchCache = new Map<
  string,
  { data: ProductSearchResponse; at: number }
>();
const CACHE_TTL_MS = 60_000;

function buildCacheKey(params: ProductSearchParams): string {
  return JSON.stringify({
    q: params.q.trim().toLowerCase(),
    outletId: params.outletId ?? "",
    categoryId: params.categoryId ?? "",
    sort: params.sort ?? "",
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  });
}

export async function searchProducts(
  params: ProductSearchParams,
  signal?: AbortSignal,
): Promise<ProductSearchResponse> {
  const q = params.q.trim();
  if (!q) {
    return {
      items: [],
      query: "",
      page: 1,
      limit: params.limit ?? 20,
      total: 0,
      totalPages: 0,
    };
  }

  const cacheKey = buildCacheKey(params);
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  const res = await customerAxios.get("/public/products/search", {
    params: {
      q,
      outletId: params.outletId,
      categoryId: params.categoryId,
      sort: params.sort,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
    signal,
  });

  const payload = res.data?.data ?? {};
  const data: ProductSearchResponse = {
    items: Array.isArray(payload.items) ? payload.items : [],
    query: payload.query ?? q,
    page: payload.page ?? 1,
    limit: payload.limit ?? params.limit ?? 20,
    total: payload.total ?? 0,
    totalPages: payload.totalPages ?? 0,
  };

  searchCache.set(cacheKey, { data, at: Date.now() });
  return data;
}

export async function fetchTrendingProducts(
  limit = 4,
): Promise<ProductListItem[]> {
  const res = await customerAxios.get("/public/products", {
    params: { trending: true, limit },
  });
  return Array.isArray(res.data?.data) ? res.data.data : [];
}

export function getProductSlug(product: ProductListItem): string {
  const slug = product.slug as string | { value?: string };
  if (typeof slug === "object" && slug !== null) {
    return slug.value ?? "";
  }
  return String(slug ?? "");
}

export function getProductName(product: ProductListItem): string {
  const name = product.name as string | { value?: string };
  if (typeof name === "object" && name !== null) {
    return name.value ?? "Product";
  }
  return String(name ?? "Product");
}
