'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { OutletUsersApi } from '../api/outlet-users.api';
import { OutletUser } from '../types/outlet-user.types';
import { getApiErrorMessage } from '@/lib/api-error';

const PAGE_SIZE = 20;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

export function useOutletUsers(outletId: string) {
  const [items, setItems] = useState<OutletUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const fetchUsers = useCallback(async () => {
    if (!outletId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await OutletUsersApi.listByOutlet(outletId);
      setItems(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setItems([]);
      setError(getApiErrorMessage(err, 'Failed to load outlet users.'));
    } finally {
      setLoading(false);
    }
  }, [outletId]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const filteredItems = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return items;

    return items.filter((user) => {
      const name = user.name?.toLowerCase() ?? '';
      const email = user.email?.toLowerCase() ?? '';
      const role = user.role?.toLowerCase() ?? '';

      return (
        name.includes(query) ||
        email.includes(query) ||
        (user.phone?.toLowerCase().includes(query) ?? false) ||
        role.includes(query)
      );
    });
  }, [items, debouncedSearch]);

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

  return {
    items: paginatedItems,
    allItems: items,
    loading,
    error,
    search,
    page,
    totalPages,
    total,
    setSearch,
    setPage,
    refresh: fetchUsers,
  };
}
