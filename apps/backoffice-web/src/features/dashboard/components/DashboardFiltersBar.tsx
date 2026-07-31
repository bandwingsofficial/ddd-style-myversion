'use client';

import { CalendarRange, Filter, RefreshCw } from 'lucide-react';

import { DashboardFilters, DashboardPeriod } from '../types/dashboard.types';

const PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: 'TODAY', label: 'Today' },
  { value: 'YESTERDAY', label: 'Yesterday' },
  { value: 'LAST_7_DAYS', label: 'Last 7 Days' },
  { value: 'LAST_30_DAYS', label: 'Last 30 Days' },
  { value: 'THIS_MONTH', label: 'This Month' },
  { value: 'LAST_MONTH', label: 'Last Month' },
  { value: 'LAST_3_MONTHS', label: 'Last 3 Months' },
  { value: 'LAST_6_MONTHS', label: 'Last 6 Months' },
  { value: 'THIS_YEAR', label: 'This Year' },
  { value: 'LAST_YEAR', label: 'Last Year' },
  { value: 'CUSTOM', label: 'Custom Range' },
];

interface Props {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function DashboardFiltersBar({
  filters,
  onChange,
  onRefresh,
  loading,
}: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <label className="space-y-1.5">
            <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <Filter size={14} /> Period
            </span>
            <select
              value={filters.period ?? 'LAST_7_DAYS'}
              onChange={(e) =>
                onChange({ ...filters, period: e.target.value as DashboardPeriod })
              }
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {filters.period === 'CUSTOM' && (
            <>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  Start Date
                </span>
                <input
                  type="date"
                  value={filters.startDate?.slice(0, 10) ?? ''}
                  onChange={(e) =>
                    onChange({ ...filters, startDate: e.target.value })
                  }
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  End Date
                </span>
                <input
                  type="date"
                  value={filters.endDate?.slice(0, 10) ?? ''}
                  onChange={(e) =>
                    onChange({ ...filters, endDate: e.target.value })
                  }
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                />
              </label>
            </>
          )}

          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">
              Order Status
            </span>
            <select
              value={filters.orderStatus ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  orderStatus: e.target.value || undefined,
                })
              }
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="">All</option>
              <option value="PAID">Paid</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">
              Payment Status
            </span>
            <select
              value={filters.paymentStatus ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  paymentStatus: e.target.value || undefined,
                })
              }
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="">All</option>
              <option value="SUCCESS">Success</option>
              <option value="INITIATED">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground md:flex">
            <CalendarRange size={14} />
            Live analytics
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
