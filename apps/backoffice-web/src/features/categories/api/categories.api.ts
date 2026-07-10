import { axiosInstance } from '@/http/axios';
import {
  Category,
  CategoryStatusChangeResponse,
} from '../types/category.types';

export const CategoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await axiosInstance.get('/categories');
    return res.data.data;
  },

  getById: async (id: string): Promise<Category> => {
    const res = await axiosInstance.get(`/categories/${id}`);
    return res.data.data;
  },

  create: async (formData: FormData): Promise<Category> => {
    const res = await axiosInstance.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  updateDetails: async (
    id: string,
    formData: FormData,
  ): Promise<Category> => {
    const res = await axiosInstance.post(
      `/categories/${id}/details`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return res.data.data;
  },

  rename: async (id: string, name: string): Promise<Category> => {
    const res = await axiosInstance.post(`/categories/${id}/rename`, {
      name,
    });
    return res.data.data;
  },

  changeSortOrder: async (
    id: string,
    sortOrder: number,
  ): Promise<Category> => {
    const res = await axiosInstance.post(
      `/categories/${id}/sort-order`,
      { sortOrder },
    );
    return res.data.data;
  },

  enable: async (id: string): Promise<CategoryStatusChangeResponse> => {
    const res = await axiosInstance.post(`/categories/${id}/enable`);
    return res.data.data;
  },

  disable: async (id: string): Promise<CategoryStatusChangeResponse> => {
    const res = await axiosInstance.post(`/categories/${id}/disable`);
    return res.data.data;
  },
};
