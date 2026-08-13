'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Loader2 } from 'lucide-react';

import { formatRupeeAmount } from '@/lib/format-currency';
import { getApiErrorMessage } from '@/lib/api-error';

import { OrdersAdminApi } from '../api/orders-admin.api';
import { AdminOrderListItem } from '../types/order.types';
import { OrderStatusBadge } from '../components/order-status-badge';

const ORDER_STATUS_OPTIONS = [
  'CREATED',
  'PAYMENT_PENDING',
  'PAID',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'FAILED',
] as const;

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

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await OrdersAdminApi.list({
        page,
        limit: 20,
        search: debouncedSearch.trim() || undefined,
        status: status || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setOrders(data.items);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load orders'));
      setOrders([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, fromDate, toDate]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const filtersActive =
    Boolean(search.trim()) || Boolean(status) || Boolean(fromDate) || Boolean(toDate);

  return (
    <div className="min-h-screen bg-background p-3 font-sans md:p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review customer orders, payment status, and fulfillment progress.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-muted/20 p-4">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search order, customer, phone..."
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-muted-foreground">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Reset All
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Outlet</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    {filtersActive
                      ? 'No orders found matching the selected filters.'
                      : 'No orders found.'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-t border-border/60 hover:bg-muted/20">
                    <td className="px-4 py-3.5 font-semibold">
                      {order.orderNumber ?? order.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div>{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3.5">{order.outletName}</td>
                    <td className="px-4 py-3.5">
                      <OrderStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-3.5">
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-4 py-3.5 font-semibold">
                      {formatRupeeAmount(order.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/15"
                      >
                        View
                        <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {Math.max(totalPages, 1)}
          {total > 0 ? ` · ${total} orders` : ''}
        </span>
        <button
          type="button"
          disabled={page >= totalPages || loading || totalPages === 0}
          onClick={() => setPage((value) => value + 1)}
          className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
