'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { DashboardApi } from '../api/dashboard.api';
import { DashboardFilters } from '../types/dashboard.types';
import { useDashboardSocket } from './use-dashboard-socket';

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  summary: (filters: DashboardFilters) => ['dashboard', 'summary', filters] as const,
  charts: (filters: DashboardFilters) => ['dashboard', 'charts', filters] as const,
  recentOrders: (filters: DashboardFilters) => ['dashboard', 'recent-orders', filters] as const,
  topProducts: (filters: DashboardFilters) => ['dashboard', 'top-products', filters] as const,
  topOutlets: (filters: DashboardFilters) => ['dashboard', 'top-outlets', filters] as const,
  topCategories: (filters: DashboardFilters) => ['dashboard', 'top-categories', filters] as const,
  lowStock: (limit: number) => ['dashboard', 'low-stock', limit] as const,
};

export function useDashboard(filters: DashboardFilters) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
  };

  useDashboardSocket(invalidateAll);

  const summaryQuery = useQuery({
    queryKey: dashboardQueryKeys.summary(filters),
    queryFn: () => DashboardApi.getSummary(filters),
    staleTime: 30_000,
  });

  const chartsQuery = useQuery({
    queryKey: dashboardQueryKeys.charts(filters),
    queryFn: () => DashboardApi.getCharts(filters),
    staleTime: 30_000,
  });

  const recentOrdersQuery = useQuery({
    queryKey: dashboardQueryKeys.recentOrders(filters),
    queryFn: () => DashboardApi.getRecentOrders(filters),
    staleTime: 15_000,
  });

  const topProductsQuery = useQuery({
    queryKey: dashboardQueryKeys.topProducts(filters),
    queryFn: () => DashboardApi.getTopProducts(filters),
    staleTime: 60_000,
  });

  const topOutletsQuery = useQuery({
    queryKey: dashboardQueryKeys.topOutlets(filters),
    queryFn: () => DashboardApi.getTopOutlets(filters),
    staleTime: 60_000,
  });

  const topCategoriesQuery = useQuery({
    queryKey: dashboardQueryKeys.topCategories(filters),
    queryFn: () => DashboardApi.getTopCategories(filters),
    staleTime: 60_000,
  });

  const lowStockQuery = useQuery({
    queryKey: dashboardQueryKeys.lowStock(10),
    queryFn: () => DashboardApi.getLowStock(10),
    staleTime: 60_000,
  });

  const loading =
    summaryQuery.isLoading ||
    chartsQuery.isLoading ||
    recentOrdersQuery.isLoading;

  const error =
    summaryQuery.error ||
    chartsQuery.error ||
    recentOrdersQuery.error;

  return {
    summary: summaryQuery.data,
    charts: chartsQuery.data,
    recentOrders: recentOrdersQuery.data ?? [],
    topProducts: topProductsQuery.data?.topProducts ?? [],
    topOutlets: topOutletsQuery.data?.topOutlets ?? [],
    topCategories: topCategoriesQuery.data?.topCategories ?? [],
    lowStock: lowStockQuery.data ?? [],
    loading,
    error,
    refresh: invalidateAll,
  };
}
