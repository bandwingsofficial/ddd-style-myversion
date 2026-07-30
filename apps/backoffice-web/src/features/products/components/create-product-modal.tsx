'use client';

import { Category } from '@/features/categories/types/category.types';
import ProductFormModal from './product-form-modal';

interface CreateProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activeCategories: Category[];
}

export default function CreateProductModal({
  open,
  onClose,
  onSuccess,
  activeCategories,
}: CreateProductModalProps) {
  return (
    <ProductFormModal
      mode="create"
      open={open}
      activeCategories={activeCategories}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
