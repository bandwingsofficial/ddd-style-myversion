'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { DashboardCharts } from '../types/dashboard.types';

const ORDER_COLORS: Record<string, string> = {
  PAYMENT_PENDING: '#94a3b8',
  PAID: '#10b981',
  CONFIRMED: '#3b82f6',
  PREPARING: '#f59e0b',
  OUT_FOR_DELIVERY: '#8b5cf6',
  DELIVERED: '#059669',
  CANCELLED: '#ef4444',
  FAILED: '#dc2626',
};

const PAYMENT_COLORS: Record<string, string> = {
  SUCCESS: '#10b981',
  INITIATED: '#f59e0b',
  FAILED: '#ef4444',
  REFUNDED: '#6366f1',
};

interface Props {
  charts?: DashboardCharts;
  loading?: boolean;
}

function ChartSkeleton() {
  return <div className="h-[280px] animate-pulse rounded-xl bg-muted/40" />;
}

export function DashboardChartsSection({ charts, loading }: Props) {
  const orderDistribution = Object.entries(charts?.orderStatusDistribution ?? {}).map(
    ([name, value]) => ({ name, value }),
  );

  const paymentDistribution = Object.entries(
    charts?.paymentStatusDistribution ?? {},
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-bold text-foreground">Revenue Trend</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Daily revenue and order volume
        </p>
        {loading || !charts ? (
          <ChartSkeleton />
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenueTrend}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fill="url(#revGradient)"
                  strokeWidth={2}
                />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-bold text-foreground">Order Status</h3>
        <p className="mb-6 text-sm text-muted-foreground">Distribution by status</p>
        {loading || !charts ? (
          <ChartSkeleton />
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {orderDistribution.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={ORDER_COLORS[entry.name] ?? '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-bold text-foreground">Payment Status</h3>
        <p className="mb-6 text-sm text-muted-foreground">Gateway outcomes</p>
        {loading || !charts ? (
          <ChartSkeleton />
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {paymentDistribution.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PAYMENT_COLORS[entry.name] ?? '#64748b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-1 text-lg font-bold text-foreground">Average Order Value</h3>
        <p className="mb-6 text-sm text-muted-foreground">Trend over selected period</p>
        {loading || !charts ? (
          <ChartSkeleton />
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.averageOrderValueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
