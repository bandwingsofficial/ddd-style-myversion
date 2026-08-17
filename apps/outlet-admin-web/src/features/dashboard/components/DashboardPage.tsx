'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  IndianRupee,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSessionGuard } from '@/features/auth/hooks/useSession';
import { formatRupeeAmount } from '@/lib/format-currency';

import { DashboardFilters } from '../types/dashboard.types';
import { DEFAULT_FILTERS, useDashboard } from '../hooks/useDashboard';
import { DashboardFiltersBar } from './DashboardFiltersBar';
import { DashboardKpiCard } from './DashboardKpiCard';
import { DashboardChartsSection } from './DashboardChartsSection';
import {
  DashboardRecentOrders,
  DashboardTopLists,
} from './DashboardTables';

export function DashboardPage() {
  const { loading: sessionLoading } = useSessionGuard();
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [refreshing, setRefreshing] = useState(false);

  const {
    summary,
    charts,
    recentOrders,
    topProducts,
    topCategories,
    loading,
    error,
    refresh,
  } = useDashboard(filters);

  const periodLabel = summary?.filters?.label ?? 'Selected period';
  const isBusy = sessionLoading || loading || refreshing;

  const handleRefresh = useCallback(async () => {
    if (isBusy) return;

    setRefreshing(true);
    try {
      const ok = await refresh();
      if (ok) {
        toast.success('Dashboard refreshed');
      }
    } finally {
      setRefreshing(false);
    }
  }, [isBusy, refresh]);

  const kpiCards = useMemo(
    () => [
      {
        title: 'Revenue',
        value: summary ? formatRupeeAmount(summary.revenue.totalRevenue) : '—',
        subtitle: periodLabel,
        icon: IndianRupee,
        accent: 'emerald' as const,
      },
      {
        title: 'Orders',
        value: summary ? summary.orders.totalOrders : '—',
        subtitle: periodLabel,
        icon: ShoppingBag,
        accent: 'blue' as const,
      },
      {
        title: 'Average Order Value',
        value: summary
          ? formatRupeeAmount(summary.orders.averageOrderValue)
          : '—',
        subtitle: periodLabel,
        icon: TrendingUp,
        accent: 'amber' as const,
      },
      {
        title: "Today's Revenue",
        value: summary ? formatRupeeAmount(summary.revenue.todaysRevenue) : '—',
        subtitle: summary
          ? `${summary.orders.todaysOrders} orders today`
          : periodLabel,
        icon: Truck,
        accent: 'violet' as const,
      },
    ],
    [summary, periodLabel],
  );

  const secondaryStats = [
    {
      label: "Yesterday's Revenue",
      value: summary
        ? formatRupeeAmount(summary.revenue.yesterdayRevenue)
        : '—',
    },
    {
      label: 'Pending Orders',
      value: summary ? summary.orders.pendingOrders : '—',
    },
    {
      label: 'Delivered',
      value: summary ? summary.orders.deliveredOrders : '—',
    },
    {
      label: 'Cancelled',
      value: summary ? summary.orders.cancelledOrders : '—',
    },
    {
      label: 'Payment Success',
      value: summary ? `${summary.payments.paymentSuccessRate}%` : '—',
    },
    {
      label: 'Completion Rate',
      value: summary ? `${summary.delivery.completionRate}%` : '—',
    },
  ];

  return (
    <div className="w-full max-w-[1400px] animate-in fade-in duration-500">
      <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Outlet Insights
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Revenue, orders, and history for this outlet using live backend
            analytics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={isBusy}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={isBusy ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      <DashboardFiltersBar filters={filters} onChange={setFilters} />

      {error ? (
        <div className="mt-4 rounded-[20px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {kpiCards.map((card) => (
          <DashboardKpiCard
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            accent={card.accent}
            loading={loading}
          />
        ))}
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {secondaryStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {stat.label}
            </p>
            {loading ? (
              <div className="mt-2 h-5 w-16 animate-pulse rounded bg-slate-100" />
            ) : (
              <p className="mt-1 text-sm font-black text-slate-900">
                {stat.value}
              </p>
            )}
          </div>
        ))}
      </section>

      <div className="mt-5">
        <DashboardChartsSection charts={charts} loading={loading} />
      </div>

      <div className="mt-5">
        <DashboardTopLists
          products={topProducts}
          categories={topCategories}
          loading={loading}
        />
      </div>

      <div className="mt-5">
        <DashboardRecentOrders orders={recentOrders} loading={loading} />
      </div>
    </div>
  );
}
