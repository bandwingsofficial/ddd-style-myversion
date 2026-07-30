import { axiosInstance } from '@/http/axios/instance';
import { StockItemsApi } from '@/features/stock-items/api/stock-items.api';

export const InventoryAPI = {
  getCentralInventory() {
    return axiosInstance.get('/inventory');
  },

  async getAllStockItems() {
    const items = await StockItemsApi.getAll();
    return { data: { data: items } };
  },

  // ADDED: Fetch outlets for the transfer dropdown
  getAllOutlets() {
    return axiosInstance.get("/outlets");
  },

  initialize(payload: {
    stockItemId: string;
    unit: string;
    quantity: number;
  }) {
    return axiosInstance.post("/inventory/initialize", payload);
  },

  addStock(payload: {
    stockItemId: string;
    quantity: number;
  }) {
    return axiosInstance.post("/inventory/add-stock", payload);
  },

  adjustStock(payload: {
    stockItemId: string;
    newAvailableQty: number;
    remarks?: string;
  }) {
    return axiosInstance.post("/inventory/adjust-stock", payload);
  },

  transferStock(payload: {
    stockItemId: string;
    outletId: string;
    quantity: number;
  }) {
    return axiosInstance.post("/inventory/transfer", payload);
  },

  getTransactions(stockItemId: string) {
    return axiosInstance.get(
      `/inventory/${stockItemId}/transactions`
    );
  }
};