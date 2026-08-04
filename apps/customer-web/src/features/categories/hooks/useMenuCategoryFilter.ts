"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { categoryToSlug, resolveCategoryFromParam } from "@/lib/category-slug";

import { Category } from "../types";
import { useCategories } from "./useCategories";

export function useMenuCategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const categoryParam = searchParams.get("category");

  const activeCategory = useMemo(
    () => resolveCategoryFromParam(categoryParam, categories),
    [categoryParam, categories],
  );

  const updateCategoryParam = useCallback(
    (category: Category | null, replace = false) => {
      const params = new URLSearchParams(searchParams.toString());

      if (category) {
        params.set("category", categoryToSlug(category.name));
      } else {
        params.delete("category");
      }

      const qs = params.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;

      if (replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    },
    [pathname, router, searchParams],
  );

  const setCategory = useCallback(
    (category: Category) => {
      updateCategoryParam(category, false);
    },
    [updateCategoryParam],
  );

  const clearCategory = useCallback(() => {
    updateCategoryParam(null, false);
  }, [updateCategoryParam]);

  return {
    categories,
    categoriesLoading,
    activeCategory,
    categoryId: activeCategory?.id ?? null,
    categoryParam,
    setCategory,
    clearCategory,
  };
}
