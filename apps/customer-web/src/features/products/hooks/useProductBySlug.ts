"use client";

import { useEffect, useState } from "react";
import { getProductBySlug } from "../api/product.api";
import { ProductDetails } from "../types/product.types";

export function useProductBySlug(slug: string) {
  const [product, setProduct] = useState<ProductDetails | null>(null);

  useEffect(() => {
    if (!slug) return;
    getProductBySlug(slug).then(setProduct);
  }, [slug]);

  return product;
}
