'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { formatRupeeAmount } from '@/lib/format-currency';
import { formatDateIST, formatTimeIST } from '@/lib/format-datetime';
import { STATUS_BADGE_COLORS } from '@/features/orders/utils/order-status.util';

import {
  DashboardRecentOrder,
  DashboardTopCategory,
  DashboardTopProduct,
} from '../types/dashboard.types';

function formatOrderTime(value: string) {
  return `${formatDateIST(value)} ${formatTimeIST(value)}`;
}

export function DashboardRecentOrders({
  orders,
  loading,
}: {
  orders: DashboardRecentOrder[];
  loading?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
          <p className="text-xs text-slate-400">
            Latest outlet orders for the selected filters
          </p>
        </div>
        <Link
          href="/orders/history"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          Order History
          <ExternalLink size={12} />
        </Link>
      </div>
      <div className="max-h-[420px] overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  Loading recent orders…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                  No orders found for the selected filters.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-slate-100 hover:bg-slate-50/80"
                >
                  <td className="px-5 py-3.5 font-semibold text-slate-800">
                    {order.orderNumber}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-700">
                      {order.customerName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {order.customerPhone}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill value={order.paymentStatus} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${
                        STATUS_BADGE_COLORS[order.orderStatus] ??
                        'border-slate-200 bg-slate-100 text-slate-600'
                      }`}
                    >
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">
                    {formatRupeeAmount(order.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">
                    {formatOrderTime(order.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DashboardTopLists({
  products,
  categories,
  loading,
}: {
  products: DashboardTopProduct[];
  categories: DashboardTopCategory[];
  loading?: boolean;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">
            Top Selling Products
          </h3>
          <p className="text-xs text-slate-400">Top 10 by revenue</p>
        </div>
        <div className="max-h-[380px] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <EmptyRow cols={3} message="Loading products…" />
              ) : products.length === 0 ? (
                <EmptyRow
                  cols={3}
                  message="No product sales in this period."
                />
              ) : (
                products.map((product) => (
                  <tr
                    key={product.productId}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">
                        {product.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {product.category}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {product.unitsSold}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {formatRupeeAmount(product.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">Top Categories</h3>
          <p className="text-xs text-slate-400">Revenue leaders</p>
        </div>
        <div className="max-h-[380px] space-y-2 overflow-auto p-4">
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Loading categories…
            </p>
          ) : categories.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No category data available.
            </p>
          ) : (
            categories.map((category) => (
              <div
                key={category.categoryId}
                className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {category.categoryName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {category.orders} orders · {category.units} products sold
                    </p>
                  </div>
                  <p className="font-bold text-emerald-600">
                    {formatRupeeAmount(category.revenue)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
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

function StatusPill({ value }: { value: string }) {
  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase text-emerald-700">
      {value.replace(/_/g, ' ')}
    </span>
  );
}
