'use client';

import { useCallback, useEffect, useState } from 'react';
import { CategoriesApi } from '../api/categories.api';
import { Category } from '../types/category.types';
import { useCategorySocket } from './use-category-socket';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const data = await CategoriesApi.getAll();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      if (!silent) {
        setError('Failed to load categories.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchCategories(false);
  }, [fetchCategories]);

  const silentRefresh = useCallback(async () => {
    await fetchCategories(true);
  }, [fetchCategories]);

  useEffect(() => {
    fetchCategories(false);
  }, [fetchCategories]);

  useCategorySocket(silentRefresh);

  const updateCategoryLocally = useCallback(
    (categoryId: string, patch: Partial<Category>) => {
      setCategories((current) =>
        current.map((category) =>
          category.id === categoryId
            ? { ...category, ...patch }
            : category,
        ),
      );
    },
    [],
  );

  return {
    categories,
    loading,
    error,
    refresh,
    silentRefresh,
    updateCategoryLocally,
  };
}
