import { useCallback, useEffect, useState } from 'react';
import { getCategories } from '../api/get-categories';
import { Category } from '../types';
import { useCategorySocket } from './useCategorySocket';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }

    try {
      const response = await getCategories();

      if (response.success) {
        setCategories(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to load categories.');
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
      if (!silent) {
        setError('Failed to load categories.');
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchCategories(false);
  }, [fetchCategories]);

  useCategorySocket(() => {
    fetchCategories(true);
  });

  return {
    categories,
    isLoading,
    error,
    refetch: () => fetchCategories(false),
  };
};
