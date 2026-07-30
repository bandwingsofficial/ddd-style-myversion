'use client';

import { useCallback, useEffect, useState } from 'react';

import { CategoriesApi } from '@/features/categories/api/categories.api';
import { Category } from '@/features/categories/types/category.types';

export function useActiveCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await CategoriesApi.listActiveForSelection();
      setCategories(items);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      setError(
        axiosError?.response?.data?.message ||
          axiosError?.message ||
          'Failed to fetch categories',
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveCategories();
  }, [fetchActiveCategories]);

  return {
    activeCategories: categories,
    loading,
    error,
    refresh: fetchActiveCategories,
  };
}
