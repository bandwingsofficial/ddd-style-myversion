'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';

import { OUTLET_ORDER_STATUS_FILTER_OPTIONS } from '@/features/orders/utils/order-status.util';

import { DashboardFilters, DashboardPeriod } from '../types/dashboard.types';
import { DEFAULT_FILTERS } from '../hooks/useDashboard';

const PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: 'TODAY', label: 'Today' },
  { value: 'YESTERDAY', label: 'Yesterday' },
  { value: 'LAST_7_DAYS', label: '7 Days' },
  { value: 'LAST_30_DAYS', label: '30 Days' },
  { value: 'THIS_MONTH', label: 'This Month' },
  { value: 'LAST_MONTH', label: 'Last Month' },
  { value: 'THIS_YEAR', label: 'This Year' },
  { value: 'LAST_YEAR', label: 'Last Year' },
  { value: 'LAST_3_MONTHS', label: '3 Months' },
  { value: 'LAST_6_MONTHS', label: '6 Months' },
  { value: 'CUSTOM', label: 'Custom Range' },
];

const PAYMENT_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Payments' },
  { value: 'INITIATED', label: 'Pending' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'REFUNDED', label: 'Refunded' },
];

const IST_TIME_ZONE = 'Asia/Kolkata';

function toIstCalendarDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

interface Props {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
}

export function DashboardFiltersBar({ filters, onChange }: Props) {
  const activePeriod = filters.period ?? 'LAST_7_DAYS';
  const [draftStartDate, setDraftStartDate] = useState(
    filters.startDate ?? toIstCalendarDate(),
  );
  const [draftEndDate, setDraftEndDate] = useState(
    filters.endDate ?? toIstCalendarDate(),
  );

  useEffect(() => {
    if (filters.startDate) {
      setDraftStartDate(filters.startDate);
    }
    if (filters.endDate) {
      setDraftEndDate(filters.endDate);
    }
  }, [filters.startDate, filters.endDate]);

  const applyCustomRange = () => {
    if (!draftStartDate || !draftEndDate) {
      toast.error('Please select both From Date and To Date.');
      return;
    }

    if (draftStartDate > draftEndDate) {
      toast.error(
        'Please select a valid date range. The To Date must be on or after the From Date.',
      );
      return;
    }

    onChange({
      ...filters,
      period: 'CUSTOM',
      startDate: draftStartDate,
      endDate: draftEndDate,
    });
  };

  const selectPeriod = (period: DashboardPeriod) => {
    if (period === 'CUSTOM') {
      const start = draftStartDate || toIstCalendarDate();
      const end = draftEndDate || toIstCalendarDate();
      setDraftStartDate(start);
      setDraftEndDate(end);
      onChange({
        ...filters,
        period: 'CUSTOM',
        startDate: start,
        endDate: end,
      });
      return;
    }

    onChange({
      ...filters,
      period,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const resetFilters = () => {
    const today = toIstCalendarDate();
    setDraftStartDate(today);
    setDraftEndDate(today);
    onChange({ ...DEFAULT_FILTERS });
  };

  const filtersActive =
    activePeriod !== 'LAST_7_DAYS' ||
    Boolean(filters.orderStatus) ||
    Boolean(filters.paymentStatus);

  return (
    <div className="space-y-3 rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {PERIOD_OPTIONS.map((option) => {
          const active = activePeriod === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => selectPeriod(option.value)}
              className={`h-9 rounded-full border px-4 text-[13px] font-semibold transition-all ${
                active
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {activePeriod === 'CUSTOM' && (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase text-slate-500">
              From Date
            </label>
            <input
              type="date"
              value={draftStartDate}
              onChange={(e) => setDraftStartDate(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase text-slate-500">
              To Date
            </label>
            <input
              type="date"
              value={draftEndDate}
              min={draftStartDate || undefined}
              onChange={(e) => setDraftEndDate(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <button
            type="button"
            onClick={applyCustomRange}
            className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            Apply
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px]">
          <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase text-slate-500">
            Order Status
          </label>
          <select
            value={filters.orderStatus ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                orderStatus: e.target.value || undefined,
              })
            }
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            {OUTLET_ORDER_STATUS_FILTER_OPTIONS.filter(
              (option) => option.value !== 'ALL',
            ).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[180px]">
          <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase text-slate-500">
            Payment Status
          </label>
          <select
            value={filters.paymentStatus ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                paymentStatus: e.target.value || undefined,
              })
            }
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
          >
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {filtersActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-red-500 transition-colors hover:bg-red-50"
          >
            <RotateCcw size={14} />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
