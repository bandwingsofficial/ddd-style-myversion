export interface Category {
  id: string;
  name: string;
  subtitle?: string; // Made optional
  imagePath: string;
}

export interface CategoryApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: Category[];
}