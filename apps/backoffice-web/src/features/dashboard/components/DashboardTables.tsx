'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Download,
  Layers,
  Package,
  Printer,
  Store,
  Users,
} from 'lucide-react';

import {
  DashboardLowStockItem,
  DashboardRecentOrder,
  DashboardRecentPayment,
  DashboardTopCategory,
  DashboardTopOutlet,
  DashboardTopProduct,
} from '../types/dashboard.types';

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function QuickActions() {
  const actions = [
    { label: 'Create Product', href: '/products', icon: Package },
    { label: 'Create Category', href: '/categories', icon: Layers },
    { label: 'Create Outlet', href: '/outlets', icon: Store },
    { label: 'View Payments', href: '/payments', icon: Download },
    { label: 'Inventory', href: '/inventory', icon: AlertTriangle },
    { label: 'Outlet Users', href: '/users', icon: Users },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background px-3 py-4 text-center text-xs font-semibold transition hover:border-primary hover:bg-primary/5"
          >
            <action.icon size={18} className="text-primary" />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

interface ExportMenuProps {
  onExport: (section: string) => void;
}

export function ExportMenu({ onExport }: ExportMenuProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onExport('summary')}
        className="inline-flex items-center gap-2 rounded-xl border border-input px-3 py-2 text-sm font-semibold"
      >
        <Download size={16} /> Export CSV
      </button>
      <button
        type="button"
        onClick={() => onExport('orders')}
        className="inline-flex items-center gap-2 rounded-xl border border-input px-3 py-2 text-sm font-semibold"
      >
        <Download size={16} /> Orders CSV
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-xl border border-input px-3 py-2 text-sm font-semibold"
      >
        <Printer size={16} /> Print
      </button>
    </div>
  );
}

export function RecentOrdersTable({
  orders,
  loading,
}: {
  orders: DashboardRecentOrder[];
  loading?: boolean;
}) {
  return (
    <Panel title="Recent Orders" subtitle="Latest order activity">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Outlet</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No orders found for this period.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div>{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3">{order.outletName}</td>
                  <td className="px-4 py-3">
                    <Badge tone="payment">{order.paymentStatus}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="order">{order.orderStatus}</Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(order.amount)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
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

export function RecentPaymentsTable({
  payments,
  loading,
}: {
  payments: DashboardRecentPayment[];
  loading?: boolean;
}) {
  return (
    <Panel title="Recent Payments" subtitle="Latest payment transactions">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Transaction</th>
              <th className="px-4 py-3">Gateway</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Attempt</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Loading payments...
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No payments found for this period.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">
                    {payment.transactionId ?? payment.id.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">{payment.gateway}</td>
                  <td className="px-4 py-3">{payment.customerName}</td>
                  <td className="px-4 py-3">
                    <Badge tone="payment">{payment.status}</Badge>
                  </td>
                  <td className="px-4 py-3">#{payment.attemptNo}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(payment.paidAt ?? payment.createdAt)}
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
    <Panel title="Top Selling Products" subtitle="Highest revenue products">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Units</th>
              <th className="px-4 py-3">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No product sales in this period.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.productId} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold">{product.productName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{product.unitsSold}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(product.revenue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function TopOutletsList({
  outlets,
}: {
  outlets: DashboardTopOutlet[];
}) {
  return (
    <Panel title="Top Outlets" subtitle="Highest revenue outlets">
      <div className="space-y-3 p-4">
        {outlets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No outlet data available.</p>
        ) : (
          outlets.map((outlet) => (
            <div
              key={outlet.outletId}
              className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3"
            >
              <div>
                <p className="font-semibold">{outlet.outletName}</p>
                <p className="text-xs text-muted-foreground">{outlet.orders} orders</p>
              </div>
              <p className="font-bold text-primary">{formatCurrency(outlet.revenue)}</p>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

export function TopCategoriesList({
  categories,
}: {
  categories: DashboardTopCategory[];
}) {
  return (
    <Panel title="Top Categories" subtitle="Highest revenue categories">
      <div className="space-y-3 p-4">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No category data available.</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.categoryId}
              className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3"
            >
              <div>
                <p className="font-semibold">{category.categoryName}</p>
                <p className="text-xs text-muted-foreground">{category.units} units sold</p>
              </div>
              <p className="font-bold text-primary">{formatCurrency(category.revenue)}</p>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

export function LowStockPanel({
  items,
  loading,
}: {
  items: DashboardLowStockItem[];
  loading?: boolean;
}) {
  return (
    <Panel title="Low Stock Alerts" subtitle="Inventory below threshold">
      <div className="space-y-3 p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading inventory...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">All stock levels are healthy.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.stockItemId}
              className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.availableQty} {item.unit} available
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                  item.level === 'OUT_OF_STOCK'
                    ? 'bg-red-100 text-red-700'
                    : item.level === 'CRITICAL'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {item.level.replace(/_/g, ' ')}
              </span>
            </div>
          ))
        )}
      </div>
    </Panel>
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
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
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
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-blue-50 text-blue-700';

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${styles}`}>
      {children}
    </span>
  );
}
