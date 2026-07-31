'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CreditCard,
  IndianRupee,
  Package,
  ShoppingBag,
  Store,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { DashboardApi } from '../api/dashboard.api';
import { DashboardFilters } from '../types/dashboard.types';
import { useDashboard } from '../hooks/use-dashboard';
import { DashboardFiltersBar } from '../components/DashboardFiltersBar';
import { DashboardChartsSection } from '../components/DashboardChartsSection';
import { KpiCard } from '../components/KpiCard';
import {
  ExportMenu,
  LowStockPanel,
  QuickActions,
  RecentOrdersTable,
  RecentPaymentsTable,
  TopCategoriesList,
  TopOutletsList,
  TopProductsTable,
} from '../components/DashboardTables';

function formatCurrency(value?: number) {
  return `₹${(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'LAST_7_DAYS',
    topLimit: 10,
  });

  const {
    summary,
    charts,
    recentOrders,
    recentPayments,
    topProducts,
    topOutlets,
    topCategories,
    lowStock,
    loading,
    error,
    refresh,
  } = useDashboard(filters);

  const kpiGroups = useMemo(
    () => [
      {
        title: 'Revenue',
        cards: [
          { title: 'Total Revenue', value: formatCurrency(summary?.revenue.totalRevenue), icon: IndianRupee, accent: 'emerald' as const },
          { title: "Today's Revenue", value: formatCurrency(summary?.revenue.todaysRevenue), icon: TrendingUp, accent: 'blue' as const },
          { title: 'Weekly Revenue', value: formatCurrency(summary?.revenue.weeklyRevenue), icon: TrendingUp, accent: 'violet' as const },
          { title: 'Monthly Revenue', value: formatCurrency(summary?.revenue.monthlyRevenue), icon: TrendingUp, accent: 'amber' as const },
        ],
      },
      {
        title: 'Orders',
        cards: [
          { title: 'Total Orders', value: summary?.orders.totalOrders ?? 0, icon: ShoppingBag, accent: 'blue' as const },
          { title: 'Delivered', value: summary?.orders.deliveredOrders ?? 0, icon: Truck, accent: 'emerald' as const },
          { title: 'Pending', value: summary?.orders.pendingOrders ?? 0, icon: Package, accent: 'amber' as const },
          { title: 'Avg Order Value', value: formatCurrency(summary?.orders.averageOrderValue), icon: IndianRupee, accent: 'violet' as const },
        ],
      },
      {
        title: 'Customers & Catalog',
        cards: [
          { title: 'Total Customers', value: summary?.customers.totalCustomers ?? 0, icon: Users, accent: 'blue' as const },
          { title: 'New Customers', value: summary?.customers.newCustomers ?? 0, icon: Users, accent: 'emerald' as const },
          { title: 'Active Products', value: summary?.catalog.activeProducts ?? 0, icon: Package, accent: 'amber' as const },
          { title: 'Active Outlets', value: summary?.catalog.activeOutlets ?? 0, icon: Store, accent: 'slate' as const },
        ],
      },
      {
        title: 'Payments',
        cards: [
          { title: 'Successful Payments', value: summary?.payments.successfulPayments ?? 0, icon: CreditCard, accent: 'emerald' as const },
          { title: 'Failed Payments', value: summary?.payments.failedPayments ?? 0, icon: AlertCircle, accent: 'rose' as const },
          { title: 'Pending Payments', value: summary?.payments.pendingPayments ?? 0, icon: CreditCard, accent: 'amber' as const },
          { title: 'Success Rate', value: `${summary?.payments.paymentSuccessRate ?? 0}%`, icon: TrendingUp, accent: 'violet' as const },
        ],
      },
    ],
    [summary],
  );

  const handleExport = async (section: string) => {
    try {
      const blob = await DashboardApi.exportCsv(filters, section);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-${section}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (exportError) {
      console.error(exportError);
      toast.error('Export failed');
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 font-sans animate-in fade-in duration-500 print:p-0">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Executive Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time business intelligence across revenue, orders, payments, and inventory.
          </p>
          {summary?.filters?.label && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-primary">
              {summary.filters.label}
            </p>
          )}
        </div>
        <ExportMenu onExport={handleExport} />
      </div>

      <div className="mb-6 space-y-6">
        <DashboardFiltersBar
          filters={filters}
          onChange={setFilters}
          onRefresh={refresh}
          loading={loading}
        />
        <QuickActions />
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load dashboard data. Please refresh.
        </div>
      )}

      <div className="space-y-8">
        {kpiGroups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {group.cards.map((card) => (
                <KpiCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  accent={card.accent}
                  loading={loading}
                />
              ))}
            </div>
          </section>
        ))}

        <DashboardChartsSection charts={charts} loading={loading} />

        <div className="grid gap-6 xl:grid-cols-2">
          <RecentOrdersTable orders={recentOrders} loading={loading} />
          <RecentPaymentsTable payments={recentPayments} loading={loading} />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <TopProductsTable products={topProducts} loading={loading} />
          </div>
          <LowStockPanel items={lowStock} loading={loading} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <TopOutletsList outlets={topOutlets} />
          <TopCategoriesList categories={topCategories} />
        </div>
      </div>
    </div>
  );
}
