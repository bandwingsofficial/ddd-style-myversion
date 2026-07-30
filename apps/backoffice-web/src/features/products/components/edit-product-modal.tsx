'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Category } from '@/features/categories/types/category.types';
import { ProductsApi } from '../api/products.api';
import { Product } from '../types/product.types';
import ProductFormModal from './product-form-modal';

interface EditProductModalProps {
  product: Product | null;
  activeCategories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProductModal({
  product,
  activeCategories,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const [loadedProduct, setLoadedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product) {
      setLoadedProduct(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadedProduct(null);

    ProductsApi.getById(product.id)
      .then((data) => {
        if (!cancelled) {
          setLoadedProduct(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadedProduct(product);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [product]);

  if (!product) {
    return null;
  }

  if (loading || !loadedProduct) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[1px]"
        onClick={onClose}
      >
        <div
          className="flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-4 shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-foreground">
            Loading product…
          </span>
        </div>
      </div>
    );
  }

  return (
    <ProductFormModal
      mode="edit"
      open
      product={loadedProduct}
      activeCategories={activeCategories}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
