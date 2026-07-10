"use client";

import { useCallback, useEffect, useState } from "react";
import { getProductsByOutlet } from "../api/product.api";
import { ProductListItem } from "../types/product.types";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { useProductSocket } from "./useProductSocket";

export function useProducts() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedOutlet = useOutletStore((state) => state.selectedOutlet);

  const fetchProducts = useCallback(() => {
    if (!selectedOutlet?.id) {
      setProducts([]);
      return;
    }

    setLoading(true);
    getProductsByOutlet(selectedOutlet.id)
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load products for outlet", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [selectedOutlet?.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useProductSocket(fetchProducts);

  return { products, loading, isOutletSelected: !!selectedOutlet };
}