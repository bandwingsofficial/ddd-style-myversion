'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { OutletsApi } from '../api/outlets.api';
import {
  Outlet,
  OutletStatusFilter,
  OutletWorkingFilter,
} from '../types/outlet.types';

const PAGE_SIZE = 20;

function normalizeWorkingStatus(
  status?: Outlet['workingState']['status'],
): 'OPEN' | 'CLOSED' {
  return status === 'OPEN' ? 'OPEN' : 'CLOSED';
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

export function useOutlets() {
  const [items, setItems] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OutletStatusFilter>('ALL');
  const [workingFilter, setWorkingFilter] =
    useState<OutletWorkingFilter>('ALL');
  const debouncedSearch = useDebouncedValue(search, 300);

  const fetchOutlets = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await OutletsApi.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      setItems([]);
      setError(
        axiosError?.response?.data?.message ||
          axiosError?.message ||
          'Failed to fetch outlets',
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchOutlets(false);
  }, [fetchOutlets]);

  const filteredItems = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return items.filter((outlet) => {
      if (statusFilter !== 'ALL' && outlet.status !== statusFilter) {
        return false;
      }

      if (
        workingFilter !== 'ALL' &&
        normalizeWorkingStatus(outlet.workingState?.status) !== workingFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        outlet.name.toLowerCase().includes(query) ||
        (outlet.branch?.toLowerCase().includes(query) ?? false) ||
        (outlet.address?.toLowerCase().includes(query) ?? false) ||
        (outlet.pincode?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [items, debouncedSearch, statusFilter, workingFilter]);

  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const paginatedItems = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page, totalPages]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const stats = useMemo(
    () => ({
      total: items.length,
      active: items.filter((outlet) => outlet.status === 'ACTIVE').length,
      closed: items.filter(
        (outlet) => normalizeWorkingStatus(outlet.workingState?.status) === 'CLOSED',
      ).length,
      open: items.filter(
        (outlet) => normalizeWorkingStatus(outlet.workingState?.status) === 'OPEN',
      ).length,
    }),
    [items],
  );

  return {
    items: paginatedItems,
    allItems: items,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    statusFilter,
    workingFilter,
    stats,
    setSearch,
    setStatusFilter,
    setWorkingFilter,
    setPage,
    refresh: () => fetchOutlets(false),
    refreshSilent: () => fetchOutlets(true),
  };
}
