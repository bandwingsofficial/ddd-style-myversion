import { ProductListItem } from "@/features/products/types/product.types";

export type ProductSearchSort =
  | "price_low"
  | "price_high"
  | "newest"
  | "popularity";

export interface ProductSearchParams {
  q: string;
  outletId?: string;
  categoryId?: string;
  sort?: ProductSearchSort;
  page?: number;
  limit?: number;
}

export interface ProductSearchResponse {
  items: ProductListItem[];
  query: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const POPULAR_SEARCHES = [
  "sugarcane",
  "coconut",
  "lemon",
  "fresh",
  "ginger",
] as const;

export const SEARCH_DEBOUNCE_MS = 300;
export const SUGGESTION_LIMIT = 8;
export const SEARCH_RESULTS_LIMIT = 24;
