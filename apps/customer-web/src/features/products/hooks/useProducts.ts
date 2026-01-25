"use client";

import { useEffect, useState } from "react";
import { getProductsByOutlet } from "../api/product.api";
import { ProductListItem } from "../types/product.types";
import { useOutletStore } from "@/features/outlet/outlet.store";

export function useProducts() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Get selected outlet from global store
  const selectedOutlet = useOutletStore((state) => state.selectedOutlet);

  useEffect(() => {
    // If no outlet is selected, we cannot fetch products
    if (!selectedOutlet?.id) {
      setProducts([]);
      return;
    }

    setLoading(true);
    getProductsByOutlet(selectedOutlet.id)
      .then((data) => {
        // Ensure data is an array before setting
        setProducts(Array.isArray(data) ? data : []); 
      })
      .catch((err) => {
        console.error("Failed to load products for outlet", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [selectedOutlet?.id]); // Re-run if outlet changes

  return { products, loading, isOutletSelected: !!selectedOutlet };
}