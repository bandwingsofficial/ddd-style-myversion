'use client';

import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog';
import { Product } from '../types/product.types';

interface DeleteProductDialogProps {
  product: Product | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function DeleteProductDialog({
  product,
  loading,
  onCancel,
  onConfirm,
}: DeleteProductDialogProps) {
  return (
    <ConfirmDeleteDialog
      open={!!product}
      title="Delete Product?"
      description="This action is permanent. All associated images and uploads will also be deleted. This action cannot be undone."
      itemLabel={product?.name?.value ?? ''}
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
