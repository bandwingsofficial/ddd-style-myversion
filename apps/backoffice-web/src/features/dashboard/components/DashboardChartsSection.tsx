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
import { dashCard, dashSectionSubtitle, dashSectionTitle } from './dashboard-ui';

const STATUS_COLORS: Record<string, string> = {
  Delivered: '#16A34A',
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
  charts?: DashboardCharts;
  loading?: boolean;
}

function ChartSkeleton() {
  return <div className="h-[300px] dash-shimmer rounded-[14px]" />;
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
    <div className="grid gap-4 lg:grid-cols-10">
      <div className={`${dashCard} p-5 lg:col-span-7`}>
        <h3 className={dashSectionTitle}>Revenue Trend</h3>
        <p className={`${dashSectionSubtitle} mb-4`}>
          Revenue performance for the selected period
        </p>
        {loading || !charts ? (
          <ChartSkeleton />
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stopColor="#16A34A" stopOpacity={0.45} />
  <stop offset="45%" stopColor="#22C55E" stopOpacity={0.18} />
  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
</linearGradient>
                </defs>
                <CartesianGrid
  stroke="#EDF4EF"
  strokeDasharray="2 4"
  vertical={false}
/>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(value) => formatRupeeAmount(value, { decimals: 0 })}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [
                    formatRupeeAmount(typeof value === 'number' ? value : 0),
                    'Revenue',
                  ]}
                  contentStyle={{
  background: "#FFFFFF",
  border: "1px solid #E4EFE8",
  borderRadius: 18,
  boxShadow: "0 16px 40px rgba(15,23,42,.10)",
}}
labelStyle={{
  color: "#0F172A",
  fontWeight: 600,
}}
itemStyle={{
  color: "#16A34A",
}}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#16A34A"
                  fill="url(#revGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className={`${dashCard} p-5 lg:col-span-3`}>
        <h3 className={dashSectionTitle}>Order Status</h3>
        <p className={`${dashSectionSubtitle} mb-4`}>
          Distribution across fulfillment stages
        </p>
        {loading || !charts ? (
          <ChartSkeleton />
        ) : orderDistribution.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">
            No orders in this period
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
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
                    borderRadius: 14,
                    border: '1px solid #D8F3E4',
                    boxShadow: '0 8px 24px rgba(16,185,129,0.08)',
                    background: '#FFFFFF',
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
