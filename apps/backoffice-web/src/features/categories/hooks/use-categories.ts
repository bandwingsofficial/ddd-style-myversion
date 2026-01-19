'use client';

import { useEffect, useState } from 'react';
import { CategoriesApi } from '../api/categories.api';
import { Category } from '../types/category.types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    const data = await CategoriesApi.getAll();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    refresh: fetchCategories,
  };
}
