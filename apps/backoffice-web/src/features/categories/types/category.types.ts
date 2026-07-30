export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface Category {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
  status: CategoryStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCategories {
  items: Category[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReorderCategoryItem {
  id: string;
  sortOrder: number;
}

export interface CategoryFormErrors {
  name?: string;
  subtitle?: string;
  image?: string;
}
