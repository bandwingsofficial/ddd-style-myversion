'use client';

import StockItemFormModal from './stock-item-form-modal';

interface CreateStockItemModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateStockItemModal({
  open,
  onClose,
  onSuccess,
}: CreateStockItemModalProps) {
  return (
    <StockItemFormModal
      mode="create"
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
