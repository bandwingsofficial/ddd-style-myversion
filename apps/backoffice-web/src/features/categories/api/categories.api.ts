import { axiosInstance } from '@/http/axios';
import {
  Category,
  PaginatedCategories,
  ReorderCategoryItem,
} from '../types/category.types';

export interface ListCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const CategoriesApi = {
  list: async (
    params: ListCategoriesParams = {},
  ): Promise<PaginatedCategories> => {
    const res = await axiosInstance.get('/categories', { params });
    return res.data.data;
  },

  /**
   * Fetches all categories by paginating through GET /categories.
   * Backend ListCategoriesQueryDto allows limit 1–100 per page.
   */
  getAll: async (): Promise<Category[]> => {
    const limit = 100;
    const firstPage = await CategoriesApi.list({ page: 1, limit });
    const items = [...firstPage.items];

    for (let page = 2; page <= firstPage.totalPages; page += 1) {
      const nextPage = await CategoriesApi.list({ page, limit });
      items.push(...nextPage.items);
    }

    return items;
  },

  /**
   * Active categories for admin selection dropdowns (e.g. Product form).
   * Uses GET /categories and filters client-side — no status query param exists.
   */
  listActiveForSelection: async (): Promise<Category[]> => {
    const categories = await CategoriesApi.getAll();
    return categories.filter((category) => category.status === 'ACTIVE');
  },

  getById: async (id: string): Promise<Category> => {
    const res = await axiosInstance.get(`/categories/${id}`);
    return res.data.data;
  },

  create: async (
    formData: FormData,
    onUploadProgress?: (progress: number) => void,
  ): Promise<Category> => {
    const res = await axiosInstance.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (!onUploadProgress || !event.total) {
          return;
        }

        onUploadProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
    return res.data.data;
  },

  update: async (
    id: string,
    formData: FormData,
    onUploadProgress?: (progress: number) => void,
  ): Promise<Category> => {
    const res = await axiosInstance.patch(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (event) => {
        if (!onUploadProgress || !event.total) {
          return;
        }

        onUploadProgress(Math.round((event.loaded * 100) / event.total));
      },
    });
    return res.data.data;
  },

  updateStatus: async (
    id: string,
    status: 'ACTIVE' | 'INACTIVE',
  ): Promise<Category> => {
    const res = await axiosInstance.patch(`/categories/${id}/status`, {
      status,
    });
    return res.data.data;
  },

  reorder: async (items: ReorderCategoryItem[]): Promise<Category[]> => {
    const res = await axiosInstance.patch('/categories/reorder', items);
    return res.data.data;
  },

  delete: async (
    id: string,
    options?: { force?: boolean },
  ): Promise<{ id: string }> => {
    const res = await axiosInstance.delete(`/categories/${id}`, {
      params: options?.force ? { force: 'true' } : undefined,
    });
    return res.data.data;
  },
};
