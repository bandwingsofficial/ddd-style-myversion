'use client';

import { StockItem } from '../types/stock-item.types';
import StockItemFormModal from './stock-item-form-modal';

interface EditStockItemModalProps {
  stockItem: StockItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditStockItemModal({
  stockItem,
  onClose,
  onSuccess,
}: EditStockItemModalProps) {
  return (
    <StockItemFormModal
      mode="edit"
      open={!!stockItem}
      stockItem={stockItem}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
