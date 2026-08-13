'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

import { Order } from '../types';
import { fetchOutletOrderHistory } from '../api/orders';

const INVALID_DATE_RANGE_MESSAGE =
  'Please select a valid date range. The To Date must be on or after the From Date.';

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

function isInvalidDateRange(fromDate: string, toDate: string): boolean {
  return Boolean(fromDate && toDate && fromDate > toDate);
}

function getApiErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  const data = error.response?.data as
    | { message?: string | string[]; code?: string }
    | undefined;

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }

  if (Array.isArray(data?.message) && typeof data.message[0] === 'string') {
    return data.message[0];
  }

  return null;
}

const PAGE_SIZE = 20;

export function useOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const debouncedSearch = useDebouncedValue(search, 400);
  // Apply cleared search immediately so Reset All does not briefly refetch with the old term.
  const effectiveSearch =
    search.trim() === '' ? '' : debouncedSearch.trim();

  const loadHistory = useCallback(
    async (silent = false) => {
      if (isInvalidDateRange(fromDate, toDate)) {
        toast.error(INVALID_DATE_RANGE_MESSAGE);
        if (!silent) {
          setLoading(false);
        }
        return;
      }

      if (!silent) {
        setLoading(true);
      }

      try {
        const data = await fetchOutletOrderHistory({
          page,
          limit: PAGE_SIZE,
          search: effectiveSearch || undefined,
          status: status === 'ALL' ? undefined : status,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        });

        setOrders(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (error) {
        const statusCode = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;
        const apiMessage = getApiErrorMessage(error);

        if (statusCode === 400) {
          toast.error(apiMessage || INVALID_DATE_RANGE_MESSAGE);
        } else {
          toast.error(
            apiMessage || 'Failed to load order history. Please try again.',
          );
        }

        setOrders([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [page, effectiveSearch, status, fromDate, toDate],
  );

  useEffect(() => {
    void loadHistory(false);
  }, [loadHistory]);

  const resetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const setSearchAndResetPage = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const setStatusAndResetPage = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const setFromDateAndResetPage = (value: string) => {
    setFromDate(value);
    setPage(1);
  };

  const setToDateAndResetPage = (value: string) => {
    setToDate(value);
    setPage(1);
  };

  const filtersActive =
    Boolean(search.trim()) ||
    status !== 'ALL' ||
    Boolean(fromDate) ||
    Boolean(toDate);

  return {
    orders,
    loading,
    page,
    total,
    totalPages,
    search,
    status,
    fromDate,
    toDate,
    filtersActive,
    setPage,
    setSearch: setSearchAndResetPage,
    setStatus: setStatusAndResetPage,
    setFromDate: setFromDateAndResetPage,
    setToDate: setToDateAndResetPage,
    resetFilters,
    refresh: () => loadHistory(false),
  };
}
