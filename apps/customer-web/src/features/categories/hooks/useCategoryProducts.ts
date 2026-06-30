"use client";

import { useMemo } from "react";
import { useProducts } from "@/features/products/hooks/useProducts";

export function useCategoryProducts(categoryId: string) {
  const { products, loading, isOutletSelected } = useProducts();

  const categoryProducts = useMemo(() => {
    return products.filter(
      (product) => product.category?.id === categoryId
    );
  }, [products, categoryId]);

  const categoryName =
    categoryProducts[0]?.category?.name ?? "Category";

  return {
    products: categoryProducts,
    categoryName,
    loading,
    isOutletSelected,
  };
}