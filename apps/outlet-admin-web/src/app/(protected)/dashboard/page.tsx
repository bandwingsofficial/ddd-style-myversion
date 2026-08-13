"use client";

import { useSessionGuard } from "@/features/auth/hooks/useSession";
import { useOrders } from "../../../features/orders/hooks/useOrders";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  AlertCircle,
  Clock,
  Filter,
  Calendar,
  X,
  ListChecks,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CustomerContactDisplay } from "@/features/orders/components/CustomerContactDisplay";
import {
  ACTIVE_PIPELINE_STATUSES,
  BackendOrderStatus,
  normalizeOrderStatus,
  ORDER_STATUS,
  OUTLET_ORDER_STATUS_FILTER_OPTIONS,
} from "@/features/orders/utils/order-status.util";

type DateFilter =
  | "TODAY"
  | "YESTERDAY"
  | "WEEK"
  | "15_DAYS"
  | "MONTH"
  | "ALL";

type StatusFilter = "ALL" | BackendOrderStatus;

export default function DashboardPage() {
  const { loading: sessionLoading } = useSessionGuard();
  const { orders, loading: ordersLoading } = useOrders();

  const [dateFilter, setDateFilter] =
    useState<DateFilter>("WEEK");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const { stats, chartPoints, recentActivity } =
    useMemo(() => {
      if (!orders)
        return {
          stats: {
            revenue: 0,
            orders: 0,
            pending: 0,
          },
          chartPoints: [],
          recentActivity: [],
        };

      const allOrders = orders;
      const now = new Date();

      const applyDateFilter = (o: any) => {
        const orderDate = new Date(o.createdAt);

        const diffInDays =
          (now.getTime() -
            orderDate.getTime()) /
          (1000 * 3600 * 24);

        if (dateFilter === "TODAY")
          return (
            orderDate.toDateString() ===
            now.toDateString()
          );

        if (dateFilter === "YESTERDAY") {
          const yesterday = new Date();

          yesterday.setDate(
            now.getDate() - 1,
          );

          return (
            orderDate.toDateString() ===
            yesterday.toDateString()
          );
        }

        if (dateFilter === "WEEK")
          return diffInDays <= 7;

        if (dateFilter === "15_DAYS")
          return diffInDays <= 15;

        if (dateFilter === "MONTH")
          return diffInDays <= 30;

        return true;
      };

      const applyStatusFilter = (
        o: { status?: string },
      ) =>
        statusFilter === "ALL" ||
        normalizeOrderStatus(o.status) ===
          statusFilter;

      const filtered = allOrders.filter(
        (o) =>
          applyDateFilter(o) &&
          applyStatusFilter(o),
      );

      const revenue = filtered.reduce(
        (sum, o) =>
          normalizeOrderStatus(o.status) ===
          ORDER_STATUS.DELIVERED
            ? sum + o.grandTotal
            : sum,
        0,
      );

      const pendingCount = filtered.filter(
        (o) =>
          ACTIVE_PIPELINE_STATUSES.includes(
            normalizeOrderStatus(
              o.status,
            ) as BackendOrderStatus,
          ),
      ).length;

      // Chart Points Calculation
      const range =
        dateFilter === "MONTH"
          ? 30
          : dateFilter === "15_DAYS"
            ? 15
            : 7;

      const points = Array.from(
        { length: range },
        (_, i) => {
          const d = new Date();

          d.setDate(
            now.getDate() - i,
          );

          const dayRevenue = allOrders
            .filter(
              (o) =>
                new Date(
                  o.createdAt,
                ).toDateString() ===
                  d.toDateString() &&
                normalizeOrderStatus(
                  o.status,
                ) ===
                  ORDER_STATUS.DELIVERED,
            )
            .reduce(
              (sum, o) =>
                sum + o.grandTotal,
              0,
            );

          return {
            name: d.toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
              },
            ),
            sales: dayRevenue,
          };
        },
      ).reverse();

      // FEATURE REPLACEMENT:
      // Recent Activity (Top 6 latest orders)
      const sortedActivity = [...filtered]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt,
            ).getTime() -
            new Date(
              a.createdAt,
            ).getTime(),
        )
        .slice(0, 6);

      return {
        stats: {
          revenue,
          orders: filtered.length,
          pending: pendingCount,
        },
        chartPoints: points,
        recentActivity:
          sortedActivity,
      };
    }, [
      orders,
      dateFilter,
      statusFilter,
    ]);

  if (
    sessionLoading ||
    ordersLoading
  ) {
    return (
      <div className="min-h-[70vh] h-[80vh] flex flex-col items-center justify-center gap-3 px-4">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            repeat: Infinity,
            duration: 1,
          }}
        >
          <Clock
            size={32}
            className="text-slate-400"
          />
        </motion.div>

        <p className="text-slate-500 font-medium text-center">
          Syncing Live Data...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 py-4 sm:px-4 sm:py-5 md:p-6">
      {/* Header */}
      <header className="mb-5 md:mb-6 flex flex-col lg:flex-row lg:flex-wrap lg:justify-between lg:items-center gap-4 md:gap-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Outlet Insights
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analyzing real-time performance
          </p>
        </div>

        {/* Filters */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Date Filter */}
          <div className="w-full sm:w-auto flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm min-w-0">
            <Calendar
              size={14}
              className="text-slate-500 shrink-0"
            />

            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(
                  e.target.value as DateFilter,
                )
              }
              className="w-full sm:w-auto min-w-0 bg-transparent border-none outline-none text-[13px] font-semibold text-slate-700 cursor-pointer"
            >
              <option value="TODAY">
                Today
              </option>

              <option value="YESTERDAY">
                Yesterday
              </option>

              <option value="WEEK">
                This Week
              </option>

              <option value="15_DAYS">
                Last 15 Days
              </option>

              <option value="MONTH">
                This Month
              </option>

              <option value="ALL">
                All Time
              </option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-auto flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm min-w-0">
            <Filter
              size={14}
              className="text-slate-500 shrink-0"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as StatusFilter,
                )
              }
              className="w-full sm:w-auto min-w-0 bg-transparent border-none outline-none text-[13px] font-semibold text-slate-700 cursor-pointer"
            >
              <option value="ALL">
                All Statuses
              </option>

              {OUTLET_ORDER_STATUS_FILTER_OPTIONS.filter(
                (option) =>
                  option.value !== "ALL",
              ).map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear */}
          {(dateFilter !== "WEEK" ||
            statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setDateFilter("WEEK");
                setStatusFilter("ALL");
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-5 md:mb-6">
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.revenue.toLocaleString(
            "en-IN",
          )}`}
          icon={<TrendingUp size={20} />}
          color="emerald"
        />

        <StatCard
          title="Orders Found"
          value={stats?.orders.toString()}
          icon={<ShoppingBag size={20} />}
          color="blue"
        />

        <StatCard
          title="Needs Attention"
          value={stats?.pending.toString()}
          icon={<AlertCircle size={20} />}
          color="amber"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-3 bg-white p-4 sm:p-6 md:p-8 rounded-[20px] md:rounded-[24px] border border-slate-100 shadow-sm min-w-0 overflow-hidden">
          <div className="mb-5 md:mb-8">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Sales Trend
            </h3>

            <p className="text-xs sm:text-[13px] text-slate-400 mt-1">
              Daily delivered revenue performance
            </p>
          </div>

          <div className="h-[240px] sm:h-[280px] md:h-[320px] w-full min-w-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={chartPoints}
              >
                <defs>
                  <linearGradient
                    id="colorSales"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#10b981"
                      stopOpacity={0.1}
                    />

                    <stop
                      offset="95%"
                      stopColor="#10b981"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "#64748b",
                  }}
                  interval="preserveStartEnd"
                />

                <YAxis hide />

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow:
                      "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  formatter={(v: number) => [
                    `₹${v}`,
                    "Revenue",
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 md:p-8 rounded-[20px] md:rounded-[24px] border border-slate-100 shadow-sm overflow-hidden min-w-0">
          <div className="flex items-center justify-between mb-5 md:mb-6 gap-3">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Recent Activity
              </h3>

              <p className="text-xs sm:text-[13px] text-slate-400 mt-0.5">
                Latest order updates
              </p>
            </div>

            <ListChecks
              size={20}
              className="text-slate-300 shrink-0"
            />
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            {recentActivity.length >
            0 ? (
              recentActivity.map(
                (order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100 transition-all hover:border-blue-100 min-w-0"
                  >
                    {/* Left */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div
                        className={`w-2 h-2 shrink-0 rounded-full ${
                          normalizeOrderStatus(
                            order.status,
                          ) ===
                          ORDER_STATUS.DELIVERED
                            ? "bg-emerald-500"
                            : normalizeOrderStatus(
                                  order.status,
                                ) ===
                                ORDER_STATUS.CANCELLED
                              ? "bg-red-500"
                              : "bg-blue-500"
                        }`}
                      />

                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-[12px] font-black text-slate-800 uppercase tracking-tight truncate">
                          {order.orderNumber}
                        </p>

                        <CustomerContactDisplay
                          order={order}
                          compact
                          className="text-[10px] text-slate-500 font-medium truncate"
                        />
                      </div>
                    </div>

                    {/* Right */}
                    <div className="text-right shrink-0 max-w-[100px] sm:max-w-none">
                      <p className="text-[11px] sm:text-[12px] font-black text-slate-900 truncate">
                        ₹
                        {
                          order.grandTotal
                        }
                      </p>

                      <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">
                        {order.status}
                      </p>
                    </div>
                  </div>
                ),
              )
            ) : (
              <div className="text-center py-16 md:py-20 text-slate-400 text-sm italic">
                No recent activity
                found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: any) {
  const colorMap: Record<
    string,
    string
  > = {
    emerald:
      "bg-emerald-50 text-emerald-500",
    blue:
      "bg-blue-50 text-blue-500",
    amber:
      "bg-amber-50 text-amber-500",
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        scale: 1.01,
      }}
      className="bg-white p-2 sm:p-3 md:p-4 rounded-[16px] sm:rounded-[18px] md:rounded-[20px] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-4 min-w-0"
    >
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 shrink-0 rounded-xl flex items-center justify-center ${colorMap[color]}`}
      >
        {icon}
      </div>

      <div className="min-w-0 w-full">
        <p className="text-[9px] sm:text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-tight truncate">
          {title}
        </p>

        <h4 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 leading-tight truncate">
          {value || "0"}
        </h4>
      </div>
    </motion.div>
  );
}