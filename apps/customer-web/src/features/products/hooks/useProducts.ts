"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getProductsByOutlet } from "../api/product.api";
import { ProductListItem } from "../types/product.types";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { useProductSocket } from "./useProductSocket";

export function useProducts() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const requestIdRef = useRef(0);

  const selectedOutlet = useOutletStore((state) => state.selectedOutlet);
  const outletRevision = useOutletStore((state) => state.outletRevision);
  const outletHydrated = useOutletStore((state) => state.hasHydrated);

  const fetchProducts = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!outletHydrated) {
      return;
    }

    if (!selectedOutlet?.id) {
      setProducts([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getProductsByOutlet(selectedOutlet.id);
      if (requestId !== requestIdRef.current) return;

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      console.error("Failed to load products for outlet", err);
      setProducts([]);
      setError("Unable to load products. Please try again.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [outletHydrated, selectedOutlet?.id, outletRevision]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts, pathname]);

  useProductSocket(fetchProducts);

  return {
    products,
    loading: !outletHydrated || loading,
    error,
    isOutletSelected: !!selectedOutlet?.id,
    outletHydrated,
    refresh: fetchProducts,
  };
}
