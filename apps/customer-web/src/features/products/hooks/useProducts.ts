"use client";

import { useEffect, useState } from "react";
import { getPublicProducts } from "../api/product.api";
import { ProductListItem } from "../types/product.types";

export function useProducts() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}
