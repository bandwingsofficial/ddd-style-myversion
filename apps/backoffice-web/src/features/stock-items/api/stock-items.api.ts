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

  /**
   * Fetches all stock items by paginating through GET /stock-items.
   * Backend ListStockItemsQueryDto allows limit 1–100 per page.
   */
  getAll: async (): Promise<StockItem[]> => {
    const limit = 100;
    const firstPage = await StockItemsApi.list({ page: 1, limit });
    const items = [...firstPage.items];

    for (let page = 2; page <= firstPage.totalPages; page += 1) {
      const nextPage = await StockItemsApi.list({ page, limit });
      items.push(...nextPage.items);
    }

    return items;
  },

  listActiveForSelection: async (): Promise<StockItem[]> => {
    const items = await StockItemsApi.getAll();
    return items.filter((item) => item.status === 'ACTIVE');
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
