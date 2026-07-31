'use client';

import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog';
import { Category } from '../types/category.types';

interface DeleteCategoryDialogProps {
  category: Category | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function DeleteCategoryDialog({
  category,
  loading,
  onCancel,
  onConfirm,
}: DeleteCategoryDialogProps) {
  return (
    <ConfirmDeleteDialog
      open={!!category}
      title="Delete Category?"
      description="This action is permanent. Images will also be deleted. This cannot be undone."
      itemLabel={category?.name ?? ''}
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
