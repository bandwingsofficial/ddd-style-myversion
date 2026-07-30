'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProductsApi } from '../api/products.api';
import {
  PaginatedProducts,
  ProductStatus,
} from '../types/product.types';
import { useProductSocket } from './use-product-socket';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

export function useProducts() {
  const [data, setData] = useState<PaginatedProducts>({
    items: [],
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const fetchProducts = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await ProductsApi.list({
          page,
          limit: 20,
          search: debouncedSearch.trim() || undefined,
          categoryId: categoryId || undefined,
          status: status || undefined,
        });

        setData(response);
      } catch (err: unknown) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };

        setError(
          axiosError?.response?.data?.message ||
            axiosError?.message ||
            'Failed to fetch products',
        );
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [page, debouncedSearch, categoryId, status],
  );

  useEffect(() => {
    fetchProducts(false);
  }, [fetchProducts]);

  useProductSocket(() => {
    fetchProducts(true);
  });

  return {
    products: data.items,
    page: data.page,
    totalPages: data.totalPages,
    total: data.total,
    loading,
    error,
    search,
    categoryId,
    status,
    setSearch,
    setCategoryId,
    setStatus,
    setPage,
    refresh: () => fetchProducts(false),
  };
}
