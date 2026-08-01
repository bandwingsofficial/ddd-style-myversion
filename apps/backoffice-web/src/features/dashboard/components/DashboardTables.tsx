'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ExternalLink,
  Package,
} from 'lucide-react';

import { formatRupeeAmount } from '@/lib/format-currency';

import {
  DashboardLowStockItem,
  DashboardRecentOrder,
  DashboardTopCategory,
  DashboardTopOutlet,
  DashboardTopProduct,
} from '../types/dashboard.types';
import {
  dashCard,
  dashListItem,
  dashSectionSubtitle,
  dashSectionTitle,
  dashTableHead,
  dashTableRow,
} from './dashboard-ui';

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatGrowth(value: number) {
  if (value === 0) return '—';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export function RecentOrdersTable({
  orders,
  loading,
}: {
  orders: DashboardRecentOrder[];
  loading?: boolean;
}) {
  return (
    <Panel title="Recent Orders" subtitle="Latest 10 orders with live updates">
      <div className="max-h-[420px] overflow-auto">
        <table className="min-w-full text-sm">
          <thead className={dashTableHead}>
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Outlet</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                  <div className="mx-auto h-8 w-48 dash-shimmer rounded-[14px]" />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                  No orders found for this period.
                </td>
              </tr>
            ) : (
              orders.slice(0, 10).map((order) => (
                <tr key={order.id} className={dashTableRow}>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{order.orderNumber}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-700">{order.customerName}</div>
                    <div className="text-xs text-slate-500">{order.customerPhone}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{order.outletName}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone="payment">{order.paymentStatus}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge tone="order">{order.orderStatus}</Badge>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">
                    {formatRupeeAmount(order.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/orders?id=${order.id}`}
                      className="inline-flex items-center gap-1 rounded-[14px] border border-[#D8F3E4] bg-[#ECFDF3] px-2.5 py-1.5 text-xs font-semibold text-[#15803D] transition duration-200 hover:border-[#86EFAC] hover:bg-[#DCFCE7]"
                    >
                      Quick View
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function TopProductsTable({
  products,
  loading,
}: {
  products: DashboardTopProduct[];
  loading?: boolean;
}) {
  return (
    <Panel title="Top Selling Products" subtitle="Top 10 by revenue">
      <div className="max-h-[380px] overflow-auto">
        <table className="min-w-full text-sm">
          <thead className={dashTableHead}>
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty Sold</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">Growth</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows cols={4} />
            ) : products.length === 0 ? (
              <EmptyRow cols={4} message="No product sales in this period." />
            ) : (
              products.slice(0, 10).map((product) => (
                <tr key={product.productId} className={dashTableRow}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductThumb image={product.productImage} name={product.productName} />
                      <div>
                        <p className="font-semibold text-slate-800">{product.productName}</p>
                        <p className="text-xs text-slate-500">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{product.unitsSold}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {formatRupeeAmount(product.revenue)}
                  </td>
                  <td className="px-4 py-3">
                    <GrowthBadge value={product.growthPercent} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function TopCategoriesPanel({
  categories,
  loading,
}: {
  categories: DashboardTopCategory[];
  loading?: boolean;
}) {
  return (
    <Panel title="Top Categories" subtitle="Revenue leaders">
      <div className="max-h-[380px] space-y-2 overflow-auto p-4 pt-0">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 dash-shimmer rounded-[14px]" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No category data available.
          </p>
        ) : (
          categories.slice(0, 10).map((category) => (
            <div
              key={category.categoryId}
              className={dashListItem}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{category.categoryName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {category.orders} orders · {category.units} products sold
                  </p>
                </div>
                <p className="font-bold text-[#16A34A]">
                  {formatRupeeAmount(category.revenue)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

export function TopOutletsPanel({
  outlets,
  loading,
}: {
  outlets: DashboardTopOutlet[];
  loading?: boolean;
}) {
  return (
    <Panel title="Top Performing Outlets" subtitle="Revenue and order volume">
      <div className="max-h-[380px] space-y-2 overflow-auto p-4 pt-0">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 dash-shimmer rounded-[14px]" />
            ))}
          </div>
        ) : outlets.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No outlet data available.
          </p>
        ) : (
          outlets.slice(0, 10).map((outlet) => (
            <div
              key={outlet.outletId}
              className={dashListItem}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{outlet.outletName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {outlet.orders} orders · Avg rating N/A
                  </p>
                </div>
                <p className="font-bold text-[#16A34A]">
                  {formatRupeeAmount(outlet.revenue)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

export function InventoryAlertsCard({
  items,
  loading,
}: {
  items: DashboardLowStockItem[];
  loading?: boolean;
}) {
  const lowStock = items.filter((item) => item.level === 'LOW' || item.level === 'CRITICAL').length;
  const outOfStock = items.filter((item) => item.level === 'OUT_OF_STOCK').length;
  const expiringSoon = 0;

  const alerts = [
    { label: 'Low Stock', value: lowStock, tone: 'amber' as const },
    { label: 'Out of Stock', value: outOfStock, tone: 'rose' as const },
    { label: 'Expiring Soon', value: expiringSoon, tone: 'slate' as const },
  ];

  return (
    <div className={`${dashCard} p-5`}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF3] text-amber-600">
          <AlertTriangle size={24} strokeWidth={2} />
        </div>
        <div>
          <h3 className={dashSectionTitle}>Inventory Alerts</h3>
          <p className={dashSectionSubtitle}>Stock health overview</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 dash-shimmer rounded-[14px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {alerts.map((alert) => (
            <div
              key={alert.label}
              className="rounded-[14px] border border-[#D8F3E4] bg-[#F7FEFA] px-4 py-4 text-center"
            >
              <p className="text-2xl font-extrabold text-slate-900">{alert.value}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {alert.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-[#D8F3E4]/70 pt-4">
          {items.slice(0, 3).map((item) => (
            <div
              key={item.stockItemId}
              className="flex items-center justify-between text-sm"
            >
              <span className="font-medium text-slate-700">{item.name}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                  item.level === 'OUT_OF_STOCK'
                    ? 'bg-red-50 text-red-600/90'
                    : 'bg-amber-50 text-amber-700/90'
                }`}
              >
                {item.level.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductThumb({ image, name }: { image: string; name: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';
  const src = image?.startsWith('http')
    ? image
    : image
      ? `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`
      : null;

  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-[#ECFDF3]">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <Package size={16} className="text-slate-400" />
      )}
    </div>
  );
}

function GrowthBadge({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  const positive = value > 0;
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        positive
          ? 'bg-emerald-50 text-emerald-700/90'
          : 'bg-red-50 text-red-600/90'
      }`}
    >
      {formatGrowth(value)}
    </span>
  );
}

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-8">
        <div className="mx-auto h-8 w-full max-w-md dash-shimmer rounded-[14px]" />
      </td>
    </tr>
  );
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-8 text-center text-slate-500">
        {message}
      </td>
    </tr>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className={`${dashCard} overflow-hidden`}>
      <div className="border-b border-[#D8F3E4]/70 px-5 py-4">
        <h3 className={dashSectionTitle}>{title}</h3>
        <p className={dashSectionSubtitle}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: 'payment' | 'order';
}) {
  const styles =
    tone === 'payment'
      ? 'bg-emerald-50 text-emerald-700/90'
      : 'bg-blue-50 text-blue-700/90';

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${styles}`}>
      {children}
    </span>
  );
}
