export interface Category {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
}

export interface CategoryApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: Category[];
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
