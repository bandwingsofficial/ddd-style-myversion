import { axiosInstance } from '@/http/axios';
import { Category } from '../types/category.types';

export const CategoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await axiosInstance.get('/categories');
    return res.data.data;
  },

  create: async (name: string): Promise<Category> => {
    const res = await axiosInstance.post('/categories', { name });
    return res.data.data;
  },

  rename: async (id: string, name: string): Promise<Category> => {
    const res = await axiosInstance.post(`/categories/${id}/rename`, { name });
    return res.data.data;
  },

  enable: async (id: string) => {
    await axiosInstance.post(`/categories/${id}/enable`);
  },

  disable: async (id: string) => {
    await axiosInstance.post(`/categories/${id}/disable`);
  },
};
