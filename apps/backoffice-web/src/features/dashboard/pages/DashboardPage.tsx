'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { IndianRupee, RefreshCw, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

import { formatRupeeAmount } from '@/lib/format-currency';

import { DashboardFilters } from '../types/dashboard.types';
import { dashboardQueryKeys, useDashboard } from '../hooks/use-dashboard';
import { DashboardFiltersBar } from '../components/DashboardFiltersBar';
import { DashboardChartsSection } from '../components/DashboardChartsSection';
import { KpiCard } from '../components/KpiCard';
import {
  InventoryAlertsCard,
  RecentOrdersTable,
  TopCategoriesPanel,
  TopOutletsPanel,
  TopProductsTable,
} from '../components/DashboardTables';
import { QuickActionsCard, QuickActionsFab } from '../components/QuickActionsWidget';

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'LAST_7_DAYS',
    topLimit: 10,
  });
  const [refreshing, setRefreshing] = useState(false);

  const {
    summary,
    charts,
    recentOrders,
    topProducts,
    topOutlets,
    topCategories,
    lowStock,
    loading,
    error,
    refresh,
  } = useDashboard(filters);

  const periodLabel = summary?.filters?.label ?? 'Selected period';
  const isBusy = loading || refreshing;

  const handleRefresh = useCallback(async () => {
    if (isBusy) return;

    setRefreshing(true);
    try {
      refresh();
      await queryClient.refetchQueries({ queryKey: dashboardQueryKeys.all });
      toast.success('Dashboard refreshed');
    } catch {
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  }, [isBusy, queryClient, refresh]);

  const kpiCards = useMemo(
    () => [
      {
        title: 'Revenue',
        value: formatRupeeAmount(summary?.revenue.totalRevenue),
        subtitle: periodLabel,
        icon: IndianRupee,
        accent: 'emerald' as const,
      },
      {
        title: 'Orders',
        value: summary?.orders.totalOrders ?? 0,
        subtitle: periodLabel,
        icon: ShoppingBag,
        accent: 'blue' as const,
      },
      {
        title: 'Customers',
        value: summary?.customers.newCustomers ?? 0,
        subtitle: `New registrations · ${periodLabel}`,
        icon: Users,
        accent: 'violet' as const,
      },
      {
        title: 'Average Order Value',
        value: formatRupeeAmount(summary?.orders.averageOrderValue),
        subtitle: periodLabel,
        icon: TrendingUp,
        accent: 'amber' as const,
      },
    ],
    [summary, periodLabel],
  );

  return (
    <div className="relative min-h-screen animate-in fade-in p-4 font-sans duration-500 md:p-5">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[1.65rem]">
              Executive Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Unified view of revenue, orders, and operations for the selected period.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={isBusy}
            className="group inline-flex h-10 shrink-0 items-center gap-2 rounded-[14px] border border-[#D8F3E4] bg-white px-4 text-sm font-semibold text-[#16A34A] transition-all duration-[250ms] hover:border-[#16A34A] hover:bg-[#16A34A] hover:text-white hover:shadow-[0_4px_14px_rgba(22,163,74,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={`transition-colors duration-[250ms] group-hover:text-white ${isBusy ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <DashboardFiltersBar filters={filters} onChange={setFilters} />

        {error && (
          <div className="rounded-[20px] border border-red-100/80 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-sm">
            Failed to load dashboard data. Please refresh.
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card) => (
            <KpiCard
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

        <DashboardChartsSection charts={charts} loading={loading} />

        <section className="grid gap-4 xl:grid-cols-3">
          <TopProductsTable products={topProducts} loading={loading} />
          <TopCategoriesPanel categories={topCategories} loading={loading} />
          <TopOutletsPanel outlets={topOutlets} loading={loading} />
        </section>

        <RecentOrdersTable orders={recentOrders} loading={loading} />

        <div className="grid gap-4 lg:grid-cols-2">
          <InventoryAlertsCard items={lowStock} loading={loading} />
          <QuickActionsCard />
        </div>
      </div>

      <QuickActionsFab />
    </div>
  );
}
