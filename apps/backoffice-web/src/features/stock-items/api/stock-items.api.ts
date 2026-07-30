import { axiosInstance } from '@/http/axios';
import {
  PaginatedStockItems,
  StockItem,
  StockItemStatus,
  StockUnit,
} from '../types/stock-item.types';

export interface ListStockItemsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const StockItemsApi = {
  list: async (
    params: ListStockItemsParams = {},
  ): Promise<PaginatedStockItems> => {
    const res = await axiosInstance.get('/stock-items', { params });
    return res.data.data;
  },

  getAll: async (): Promise<StockItem[]> => {
    const data = await StockItemsApi.list({
      page: 1,
      limit: 1000,
    });

    return data.items;
  },

  getById: async (id: string): Promise<StockItem> => {
    const res = await axiosInstance.get(`/stock-items/${id}`);
    return res.data.data;
  },

  create: async (payload: { name: string; unit: StockUnit }) => {
    const res = await axiosInstance.post('/stock-items', payload);
    return res.data.data as StockItem;
  },

  update: async (
    id: string,
    payload: { name?: string; unit?: StockUnit },
  ) => {
    const res = await axiosInstance.patch(`/stock-items/${id}`, payload);
    return res.data.data as StockItem;
  },

  updateStatus: async (id: string, status: StockItemStatus) => {
    const res = await axiosInstance.patch(`/stock-items/${id}/status`, {
      status,
    });
    return res.data.data as StockItem;
  },

  delete: async (id: string): Promise<{ id: string }> => {
    const res = await axiosInstance.delete(`/stock-items/${id}`);
    return res.data.data;
  },
};
