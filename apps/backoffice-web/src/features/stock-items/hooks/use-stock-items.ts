'use client';

import { useCallback, useEffect, useState } from 'react';
import { StockItemsApi } from '../api/stock-items.api';
import { PaginatedStockItems } from '../types/stock-item.types';
import { useStockItemSocket } from './use-stock-item-socket';

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

export function useStockItems() {
  const [data, setData] = useState<PaginatedStockItems>({
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
  const debouncedSearch = useDebouncedValue(search, 300);

  const fetchStockItems = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await StockItemsApi.list({
          page,
          limit: 20,
          search: debouncedSearch.trim() || undefined,
        });

        setData(response);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to fetch stock items',
        );
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [page, debouncedSearch],
  );

  useEffect(() => {
    fetchStockItems(false);
  }, [fetchStockItems]);

  useStockItemSocket(() => {
    fetchStockItems(true);
  });

  return {
    stockItems: data.items,
    page: data.page,
    totalPages: data.totalPages,
    total: data.total,
    loading,
    error,
    search,
    setSearch,
    setPage,
    refresh: () => fetchStockItems(false),
  };
}
