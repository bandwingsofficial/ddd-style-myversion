'use client';

import { Category } from '../types/category.types';
import CategoryFormModal from './category-form-modal';

interface EditCategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditCategoryModal({
  category,
  onClose,
  onSuccess,
}: EditCategoryModalProps) {
  return (
    <CategoryFormModal
      mode="edit"
      open={!!category}
      category={category}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
