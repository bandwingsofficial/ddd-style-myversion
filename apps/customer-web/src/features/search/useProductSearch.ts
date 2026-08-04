"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useOutletStore } from "@/features/outlet/outlet.store";
import { ProductListItem } from "@/features/products/types/product.types";

import { searchProducts } from "./search.api";
import {
  ProductSearchParams,
  ProductSearchResponse,
  ProductSearchSort,
  SEARCH_DEBOUNCE_MS,
  SUGGESTION_LIMIT,
} from "./search.types";

interface UseProductSearchOptions {
  debounceMs?: number;
  limit?: number;
  enabled?: boolean;
}

export function useProductSearch(
  query: string,
  options: UseProductSearchOptions = {},
) {
  const {
    debounceMs = SEARCH_DEBOUNCE_MS,
    limit = SUGGESTION_LIMIT,
    enabled = true,
  } = options;

  const selectedOutletId = useOutletStore((s) => s.selectedOutlet?.id);
  const [results, setResults] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<Omit<ProductSearchResponse, "items"> | null>(
    null,
  );

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const runSearch = useCallback(
    async (params: ProductSearchParams) => {
      const trimmed = params.q.trim();
      if (!trimmed) {
        setResults([]);
        setMeta(null);
        setError(null);
        setLoading(false);
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const requestId = ++requestIdRef.current;

      setLoading(true);
      setError(null);

      try {
        const response = await searchProducts(
          {
            ...params,
            q: trimmed,
            outletId: params.outletId ?? selectedOutletId,
          },
          controller.signal,
        );

        if (requestId !== requestIdRef.current) return;

        setResults(response.items);
        setMeta({
          query: response.query,
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        });
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        if (requestId !== requestIdRef.current) return;
        setResults([]);
        setMeta(null);
        setError("Could not search products. Please try again.");
        console.error("Product search failed", err);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [selectedOutletId],
  );

  useEffect(() => {
    if (!enabled) return;

    const trimmed = query.trim();
    if (!trimmed) {
      abortRef.current?.abort();
      setResults([]);
      setMeta(null);
      setLoading(false);
      setError(null);
      return;
    }

    const timer = window.setTimeout(() => {
      void runSearch({ q: trimmed, limit });
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query, debounceMs, limit, enabled, runSearch]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const searchNow = useCallback(
    (params: {
      q: string;
      categoryId?: string;
      sort?: ProductSearchSort;
      page?: number;
      limit?: number;
    }) => runSearch(params),
    [runSearch],
  );

  return {
    results,
    loading,
    error,
    meta,
    searchNow,
  };
}
