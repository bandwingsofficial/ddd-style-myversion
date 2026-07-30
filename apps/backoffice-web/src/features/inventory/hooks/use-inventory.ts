'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { InventoryApi } from '../api/inventory.api';
import { InventoryListItem } from '../types/inventory.types';

const PAGE_SIZE = 20;

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

export function useInventory() {
  const [items, setItems] = useState<InventoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const fetchInventory = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    setError(null);

    try {
      const merged = await InventoryApi.listMerged();
      setItems(merged);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      setError(
        axiosError?.response?.data?.message ||
          axiosError?.message ||
          'Failed to fetch inventory',
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchInventory(false);
  }, [fetchInventory]);

  const filteredItems = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter(
      (item) =>
        item.stockName.toLowerCase().includes(query) ||
        item.stockItemId.toLowerCase().includes(query),
    );
  }, [items, debouncedSearch]);

  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const paginatedItems = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page, totalPages]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return {
    items: paginatedItems,
    allItems: items,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    setSearch,
    setPage,
    refresh: () => fetchInventory(false),
  };
}
