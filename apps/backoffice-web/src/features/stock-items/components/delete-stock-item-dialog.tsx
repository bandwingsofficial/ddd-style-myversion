'use client';

import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog';
import { StockItem } from '../types/stock-item.types';

interface DeleteStockItemDialogProps {
  stockItem: StockItem | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function DeleteStockItemDialog({
  stockItem,
  loading,
  onCancel,
  onConfirm,
}: DeleteStockItemDialogProps) {
  return (
    <ConfirmDeleteDialog
      open={!!stockItem}
      title="Delete Stock Item?"
      description="This action is permanent. Any associated uploaded files or images will also be deleted. This action cannot be undone."
      itemLabel={stockItem?.name ?? ''}
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
