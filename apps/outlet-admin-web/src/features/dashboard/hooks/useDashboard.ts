'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

import { outletService } from '@/features/outlet/services/outletService';
import { useOrderSocket } from '@/features/orders/hooks/useOrderSocket';

import { DashboardApi } from '../api/dashboard.api';
import {
  DashboardCharts,
  DashboardFilters,
  DashboardRecentOrder,
  DashboardSummary,
  DashboardTopCategory,
  DashboardTopProduct,
} from '../types/dashboard.types';

const DEFAULT_FILTERS: DashboardFilters = {
  period: 'LAST_7_DAYS',
  topLimit: 10,
};

function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Failed to load dashboard data. Please try again.';
  }

  const data = error.response?.data as
    | { message?: string | string[] }
    | undefined;

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (Array.isArray(data?.message) && typeof data.message[0] === 'string') {
    return data.message[0];
  }

  return 'Failed to load dashboard data. Please try again.';
}

export function useDashboard(filters: DashboardFilters) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [recentOrders, setRecentOrders] = useState<DashboardRecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<DashboardTopProduct[]>([]);
  const [topCategories, setTopCategories] = useState<DashboardTopCategory[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [outletId, setOutletId] = useState<string | null>(null);

  const loadDashboard = useCallback(
    async (silent = false): Promise<boolean> => {
      if (!silent) {
        setLoading(true);
      }

      setError(null);

      try {
        const [
          summaryData,
          chartsData,
          ordersData,
          productsData,
          categoriesData,
        ] = await Promise.all([
          DashboardApi.getSummary(filters),
          DashboardApi.getCharts(filters),
          DashboardApi.getRecentOrders(filters),
          DashboardApi.getTopProducts(filters),
          DashboardApi.getTopCategories(filters),
        ]);

        setSummary(summaryData);
        setCharts(chartsData);
        setRecentOrders(ordersData ?? []);
        setTopProducts(productsData?.topProducts ?? []);
        setTopCategories(categoriesData?.topCategories ?? []);
        return true;
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);

        if (!silent) {
          toast.error(message);
        }
        return false;
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [filters],
  );

  useEffect(() => {
    void loadDashboard(false);
  }, [loadDashboard]);

  useEffect(() => {
    outletService
      .getOutlet()
      .then((outlet) => setOutletId(outlet.id))
      .catch(() => setOutletId(null));
  }, []);

  useOrderSocket(() => {
    void loadDashboard(true);
  }, outletId);

  return {
    summary,
    charts,
    recentOrders,
    topProducts,
    topCategories,
    loading,
    error,
    refresh: () => loadDashboard(false),
  };
}

export { DEFAULT_FILTERS };
