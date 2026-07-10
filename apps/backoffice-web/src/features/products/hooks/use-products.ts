"use client";

import { useEffect, useState, useCallback } from "react";
import { ProductsAPI } from "../services/products.api";
import { Product } from "../types/product.types";
import { useProductSocket } from "./use-product-socket";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProductsAPI.fetchAll();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useProductSocket(fetchProducts);

  return {
    products,
    loading,
    error,
    refresh: fetchProducts,
  };
}