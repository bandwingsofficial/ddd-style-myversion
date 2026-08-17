'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatRupeeAmount } from '@/lib/format-currency';

import { DashboardCharts } from '../types/dashboard.types';

const STATUS_COLORS: Record<string, string> = {
  Delivered: '#10b981',
  Preparing: '#3B82F6',
  Pending: '#F59E0B',
  Cancelled: '#EF4444',
  Refunded: '#8B5CF6',
};

function mapOrderStatusDistribution(
  distribution: Record<string, number> | undefined,
) {
  const source = distribution ?? {};
  const delivered = source.DELIVERED ?? 0;
  const preparing =
    (source.PREPARING ?? 0) +
    (source.CONFIRMED ?? 0) +
    (source.OUT_FOR_DELIVERY ?? 0);
  const cancelled = (source.CANCELLED ?? 0) + (source.FAILED ?? 0);
  const pending = (source.PAYMENT_PENDING ?? 0) + (source.PAID ?? 0);
  const refunded = source.REFUNDED ?? 0;

  return [
    { name: 'Delivered', value: delivered },
    { name: 'Preparing', value: preparing },
    { name: 'Cancelled', value: cancelled },
    { name: 'Refunded', value: refunded },
    { name: 'Pending', value: pending },
  ].filter((item) => item.value > 0);
}

interface Props {
  charts?: DashboardCharts | null;
  loading?: boolean;
}

export function DashboardChartsSection({ charts, loading }: Props) {
  const orderDistribution = mapOrderStatusDistribution(
    charts?.orderStatusDistribution,
  );

  const revenueTrend =
    charts?.revenueTrend.map((point) => ({
      ...point,
      label: point.date,
    })) ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="min-w-0 overflow-hidden rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:col-span-3">
        <div className="mb-5">
          <h3 className="text-base font-bold text-slate-900 sm:text-lg">
            Revenue Trend
          </h3>
          <p className="mt-1 text-xs text-slate-400 sm:text-[13px]">
            Backend revenue for the selected period
          </p>
        </div>
        {loading || !charts ? (
          <div className="h-[280px] animate-pulse rounded-2xl bg-slate-50" />
        ) : revenueTrend.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm italic text-slate-400">
            No revenue data for the selected filters.
          </div>
        ) : (
          <div className="h-[280px] w-full min-w-0 md:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="outletRevGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(value) =>
                    formatRupeeAmount(value, { decimals: 0 })
                  }
                  width={56}
                />
                <Tooltip
                  formatter={(value) => [
                    formatRupeeAmount(typeof value === 'number' ? value : 0),
                    'Revenue',
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#outletRevGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="min-w-0 overflow-hidden rounded-[20px] border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
        <div className="mb-5">
          <h3 className="text-base font-bold text-slate-900 sm:text-lg">
            Order Status
          </h3>
          <p className="mt-1 text-xs text-slate-400 sm:text-[13px]">
            Distribution across fulfillment stages
          </p>
        </div>
        {loading || !charts ? (
          <div className="h-[280px] animate-pulse rounded-2xl bg-slate-50" />
        ) : orderDistribution.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center text-sm italic text-slate-400">
            No orders found for the selected filters.
          </div>
        ) : (
          <div className="h-[280px] md:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={84}
                  paddingAngle={2}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={2}
                >
                  {orderDistribution.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] ?? '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
