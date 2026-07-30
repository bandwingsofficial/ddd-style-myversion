'use client';

import { Loader2 } from 'lucide-react';

import { Product } from '../types/product.types';

interface DeleteProductDialogProps {
  product: Product | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteProductDialog({
  product,
  loading,
  onCancel,
  onConfirm,
}: DeleteProductDialogProps) {
  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-foreground">Delete Product?</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This action is permanent. All associated images and uploads will also
          be deleted. This action cannot be undone.
        </p>
        <p className="mt-4 rounded-xl bg-muted/40 px-4 py-3 text-sm font-semibold text-foreground">
          {product.name.value}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-input px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
