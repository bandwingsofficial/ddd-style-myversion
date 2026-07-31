"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getProductBySlug } from "../api/product.api";
import { ProductDetails } from "../types/product.types";
import { useProductSocket } from "./useProductSocket";

export function useProductBySlug(slug: string | undefined) {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const requestIdRef = useRef(0);

  const fetchProduct = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!slug) {
      setProduct(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getProductBySlug(slug);
      if (requestId !== requestIdRef.current) return;
      setProduct(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("Failed to load product details", err);
      setProduct(null);
      setError("Unable to load product details.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [slug]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct, pathname]);

  useProductSocket(fetchProduct);

  return { product, loading, error, refresh: fetchProduct };
}
