import { axiosInstance } from '@/http/axios/instance';
import { StockItem, StockUnit } from './stockItems.types';

export const StockItemsAPI = {
  /** GET /stock-items */
  getAll: async (): Promise<StockItem[]> => {
    const res = await axiosInstance.get('/stock-items');
    return res.data.data;
  },

  /** GET /stock-items/:id */
  getById: async (id: string): Promise<StockItem> => {
    const res = await axiosInstance.get(`/stock-items/${id}`);
    return res.data.data;
  },

  /** POST /stock-items */
  create: async (payload: { name: string; unit: StockUnit }) => {
    const res = await axiosInstance.post('/stock-items', payload);
    return res.data.data;
  },

  /** POST /stock-items/:id/rename */
  rename: async (id: string, name: string) => {
    const res = await axiosInstance.post(
      `/stock-items/${id}/rename`,
      { name }
    );
    return res.data.data;
  },

  /** POST /stock-items/:id/unit */
  changeUnit: async (id: string, unit: StockUnit) => {
    const res = await axiosInstance.post(
      `/stock-items/${id}/unit`,
      { unit }
    );
    return res.data.data;
  },

  /** POST /stock-items/:id/disable */
  disable: async (id: string) => {
    const res = await axiosInstance.post(
      `/stock-items/${id}/disable`
    );
    return res.data.data;
  },

  /** POST /stock-items/:id/enable */
  enable: async (id: string) => {
    const res = await axiosInstance.post(
      `/stock-items/${id}/enable`
    );
    return res.data.data;
  },
};
