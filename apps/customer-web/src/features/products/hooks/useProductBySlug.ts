"use client";

import { useCallback, useEffect, useState } from "react";
import { getProductBySlug } from "../api/product.api";
import { ProductDetails } from "../types/product.types";
import { useProductSocket } from "./useProductSocket";

export function useProductBySlug(slug: string | undefined) {
  const [product, setProduct] = useState<ProductDetails | null>(null);

  const fetchProduct = useCallback(() => {
    if (!slug) return;
    getProductBySlug(slug)
      .then(setProduct)
      .catch((err) => console.error("Failed to load product details", err));
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useProductSocket(fetchProduct);

  return product;
}