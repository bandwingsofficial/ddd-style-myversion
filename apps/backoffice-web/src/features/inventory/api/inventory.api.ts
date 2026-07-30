import { axiosInstance } from '@/http/axios';
import { StockItemsApi } from '@/features/stock-items/api/stock-items.api';
import { StockItem } from '@/features/stock-items/types/stock-item.types';
import { OutletService } from '@/features/outlets/outlet.service';
import {
  InventoryItem,
  InventoryListItem,
  InventoryTransaction,
} from '../types/inventory.types';

export const InventoryApi = {
  list: async (): Promise<InventoryItem[]> => {
    const res = await axiosInstance.get('/inventory');
    return res.data.data;
  },

  listMerged: async (): Promise<InventoryListItem[]> => {
    const [inventory, stockItems] = await Promise.all([
      InventoryApi.list(),
      StockItemsApi.getAll(),
    ]);

    const stockMap = new Map<string, StockItem>(
      stockItems.map((item) => [item.id, item]),
    );

    return inventory.map((item) => {
      const stock = stockMap.get(item.stockItemId);

      return {
        ...item,
        stockName: stock?.name ?? item.stockItemId,
        status: stock?.status ?? item.status,
        currentQuantity: stock?.currentQuantity ?? item.totalQty.value,
      };
    });
  },

  listActiveStockItemsForInitialize: async (
    initializedStockItemIds: string[],
  ): Promise<StockItem[]> => {
    const initialized = new Set(initializedStockItemIds);
    const activeItems = await StockItemsApi.listActiveForSelection();

    return activeItems.filter((item) => !initialized.has(item.id));
  },

  getTransactions: async (
    stockItemId: string,
  ): Promise<InventoryTransaction[]> => {
    const res = await axiosInstance.get(
      `/inventory/${stockItemId}/transactions`,
    );
    return res.data.data;
  },

  listActiveOutlets: async () => {
    const outlets = await OutletService.getAll();
    return outlets.filter(
      (outlet: { status?: string }) => outlet.status === 'ACTIVE',
    );
  },

  initialize: async (payload: {
    stockItemId: string;
    unit: string;
    quantity: number;
  }): Promise<InventoryItem> => {
    const res = await axiosInstance.post('/inventory/initialize', payload);
    return res.data.data;
  },

  addStock: async (payload: {
    stockItemId: string;
    quantity: number;
    remarks?: string;
  }): Promise<InventoryItem> => {
    const res = await axiosInstance.post('/inventory/add-stock', payload);
    return res.data.data;
  },

  adjustStock: async (payload: {
    stockItemId: string;
    adjustmentType: 'ADD' | 'DEDUCT';
    adjustmentQuantity: number;
    remarks: string;
  }): Promise<InventoryItem> => {
    const res = await axiosInstance.post('/inventory/adjust-stock', payload);
    return res.data.data;
  },

  transferStock: async (payload: {
    stockItemId: string;
    outletId: string;
    quantity: number;
  }) => {
    const res = await axiosInstance.post('/inventory/transfer', payload);
    return res.data.data;
  },
};

/** @deprecated Use InventoryApi */
export const InventoryAPI = InventoryApi;
