'use client';

import CategoryFormModal from './category-form-modal';

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCategoryModal({
  open,
  onClose,
  onSuccess,
}: CreateCategoryModalProps) {
  return (
    <CategoryFormModal
      mode="create"
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
