'use client';

import { useCallback, useEffect, useState } from 'react';
import { CategoriesApi } from '../api/categories.api';
import { Category, PaginatedCategories } from '../types/category.types';
import { useCategorySocket } from './use-category-socket';

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

export function useCategories() {
  const [data, setData] = useState<PaginatedCategories>({
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

  const fetchCategories = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await CategoriesApi.list({
          page,
          limit: 20,
          search: debouncedSearch.trim() || undefined,
        });

        setData(response);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to fetch categories',
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
    fetchCategories(false);
  }, [fetchCategories]);

  useCategorySocket(() => {
    fetchCategories(true);
  });

  const patchCategoryLocally = useCallback(
    (categoryId: string, patch: Partial<Category>) => {
      setData((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === categoryId ? { ...item, ...patch } : item,
        ),
      }));
    },
    [],
  );

  return {
    categories: data.items,
    page: data.page,
    totalPages: data.totalPages,
    total: data.total,
    loading,
    error,
    search,
    setSearch,
    setPage,
    refresh: () => fetchCategories(false),
    patchCategoryLocally,
  };
}
