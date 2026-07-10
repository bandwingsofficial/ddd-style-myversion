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

export interface CategoryStatusChangeResponse {
  id: string;
  status: CategoryStatus;
}

export interface CategoriesUpdatedSocketPayload {
  version: number;
  categories: Array<{
    id: string;
    name: string;
    imagePath?: string;
    sortOrder: number;
  }>;
}
