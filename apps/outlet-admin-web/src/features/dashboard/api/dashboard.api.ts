import { api } from '@/http/axios/instance';

import {
  DashboardApiEnvelope,
  DashboardCharts,
  DashboardFilters,
  DashboardRecentOrder,
  DashboardSummary,
  DashboardTopCategory,
  DashboardTopProduct,
} from '../types/dashboard.types';

function toParams(filters: DashboardFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    period: filters.period ?? 'LAST_7_DAYS',
  };

  if (filters.period === 'CUSTOM' && filters.startDate && filters.endDate) {
    params.startDate = filters.startDate;
    params.endDate = filters.endDate;
  }

  if (filters.orderStatus) {
    params.orderStatus = filters.orderStatus;
  }

  if (filters.paymentStatus) {
    params.paymentStatus = filters.paymentStatus;
  }

  if (filters.topLimit) {
    params.topLimit = filters.topLimit;
  }

  return params;
}

function unwrap<T>(payload: DashboardApiEnvelope<T>): T {
  return payload.data;
}

export const DashboardApi = {
  getSummary: async (filters: DashboardFilters = {}) => {
    const { data } = await api.get<DashboardApiEnvelope<DashboardSummary>>(
      '/admin/dashboard/summary',
      { params: toParams(filters) },
    );
    return unwrap(data);
  },

  getCharts: async (filters: DashboardFilters = {}) => {
    const { data } = await api.get<DashboardApiEnvelope<DashboardCharts>>(
      '/admin/dashboard/charts',
      { params: toParams(filters) },
    );
    return unwrap(data);
  },

  getRecentOrders: async (filters: DashboardFilters = {}) => {
    const { data } = await api.get<DashboardApiEnvelope<DashboardRecentOrder[]>>(
      '/admin/dashboard/recent-orders',
      { params: toParams({ ...filters, topLimit: filters.topLimit ?? 10 }) },
    );
    return unwrap(data);
  },

  getTopProducts: async (filters: DashboardFilters = {}) => {
    const { data } = await api.get<
      DashboardApiEnvelope<{ topProducts: DashboardTopProduct[] }>
    >('/admin/dashboard/products', {
      params: toParams({ ...filters, topLimit: filters.topLimit ?? 10 }),
    });
    return unwrap(data);
  },

  getTopCategories: async (filters: DashboardFilters = {}) => {
    const { data } = await api.get<
      DashboardApiEnvelope<{ topCategories: DashboardTopCategory[] }>
    >('/admin/dashboard/categories', {
      params: toParams({ ...filters, topLimit: filters.topLimit ?? 5 }),
    });
    return unwrap(data);
  },
};
