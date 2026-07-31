import { axiosInstance } from '@/http/axios';

import {
  DashboardCharts,
  DashboardFilters,
  DashboardLowStockItem,
  DashboardRecentOrder,
  DashboardRecentPayment,
  DashboardSummary,
  DashboardTopCategory,
  DashboardTopOutlet,
  DashboardTopProduct,
} from '../types/dashboard.types';

function unwrap<T>(res: { data: { data: T } }) {
  return res.data.data;
}

export const DashboardApi = {
  getSummary: async (filters: DashboardFilters = {}) => {
    const res = await axiosInstance.get<{ data: DashboardSummary }>(
      '/admin/dashboard/summary',
      { params: filters },
    );
    return unwrap(res);
  },

  getCharts: async (filters: DashboardFilters = {}) => {
    const res = await axiosInstance.get<{ data: DashboardCharts }>(
      '/admin/dashboard/charts',
      { params: filters },
    );
    return unwrap(res);
  },

  getRecentOrders: async (filters: DashboardFilters = {}) => {
    const res = await axiosInstance.get<{ data: DashboardRecentOrder[] }>(
      '/admin/dashboard/recent-orders',
      { params: { ...filters, topLimit: filters.topLimit ?? 10 } },
    );
    return unwrap(res);
  },

  getRecentPayments: async (filters: DashboardFilters = {}) => {
    const res = await axiosInstance.get<{ data: DashboardRecentPayment[] }>(
      '/admin/dashboard/recent-payments',
      { params: { ...filters, topLimit: filters.topLimit ?? 10 } },
    );
    return unwrap(res);
  },

  getTopProducts: async (filters: DashboardFilters = {}) => {
    const res = await axiosInstance.get<{ data: { topProducts: DashboardTopProduct[] } }>(
      '/admin/dashboard/products',
      { params: { ...filters, topLimit: filters.topLimit ?? 10 } },
    );
    return unwrap(res);
  },

  getTopOutlets: async (filters: DashboardFilters = {}) => {
    const res = await axiosInstance.get<{ data: { topOutlets: DashboardTopOutlet[] } }>(
      '/admin/dashboard/outlets',
      { params: { ...filters, topLimit: filters.topLimit ?? 5 } },
    );
    return unwrap(res);
  },

  getTopCategories: async (filters: DashboardFilters = {}) => {
    const res = await axiosInstance.get<{ data: { topCategories: DashboardTopCategory[] } }>(
      '/admin/dashboard/categories',
      { params: { ...filters, topLimit: filters.topLimit ?? 5 } },
    );
    return unwrap(res);
  },

  getLowStock: async (limit = 10) => {
    const res = await axiosInstance.get<{ data: DashboardLowStockItem[] }>(
      '/admin/dashboard/low-stock',
      { params: { topLimit: limit } },
    );
    return unwrap(res);
  },

  exportCsv: async (filters: DashboardFilters, section: string) => {
    const res = await axiosInstance.get<string>('/admin/dashboard/export/csv', {
      params: { ...filters, section },
      responseType: 'blob',
    });
    return res.data;
  },
};
