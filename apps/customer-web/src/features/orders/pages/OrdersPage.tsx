"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Package, ShoppingBag, Search, SlidersHorizontal, RefreshCw } from "lucide-react";
import Header from "@/components/customer/Header";
import OrderCard from "../components/OrderCard";
import { useOrders } from "../hooks/useOrders";

type FilterStatus = "ALL" | "DELIVERED" | "PENDING" | "CANCELLED";

export default function OrdersPage() {
  const { orders, loading } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("ALL");

  // Filter and Search logic to elevate the UX
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) => {
      const matchesSearch = order.id?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            order.items?.some((item: any) => item.name?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (activeFilter === "ALL") return matchesSearch;
      return order.status?.toUpperCase() === activeFilter && matchesSearch;
    });
  }, [orders, searchQuery, activeFilter]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/60 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute h-full w-full animate-ping rounded-full bg-emerald-100 opacity-75" />
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-slate-600 animate-pulse">
            Loading your fresh orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 antialiased">
      <Header />

      {/* Increased padding-top (pt-32) to perfectly clear fixed headers */}
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        
        {/* Modern Top Level Header Section - Only shows if user has orders */}
        {orders && orders.length > 0 && (
          <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 shadow-xl shadow-slate-900/10 sm:p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/5 blur-2xl" />
            
            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Customer Dashboard
                </span>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  My Orders
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  Track your real-time cane juice deliveries and view order history.
                </p>
              </div>

              {/* Total Orders Metric Badge */}
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md min-w-[180px]">
                <div className="rounded-xl bg-emerald-500/20 p-3 text-emerald-400">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Total Orders
                  </p>
                  <p className="text-3xl font-extrabold text-white">
                    {orders?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Controls Bar (Only shows if user has orders) */}
        {orders && orders.length > 0 && (
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Order ID or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>

            {/* Segmented Filter Controls */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {(["ALL", "PENDING", "DELIVERED", "CANCELLED"] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all duration-200 ${
                    activeFilter === status
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Orders Display States */}
        {orders && orders.length === 0 ? (
          /* Premium Empty State */
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-md sm:p-20">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50" />
            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner">
                <Package size={42} className="text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                No Orders Placed Yet
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-slate-500">
                Looks like you haven't enjoyed our 100% natural cold-pressed cane juices yet. Treat yourself today!
              </p>
              <div className="mt-8">
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all duration-200 hover:scale-[1.02] hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
                >
                  Explore Delicious Menu
                </Link>
              </div>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* No Search Results Fallback State */
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
            <SlidersHorizontal className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-4 text-sm font-medium text-slate-600">No orders match your current filters or search query.</p>
            <button 
              onClick={() => { setSearchQuery(""); setActiveFilter("ALL"); }}
              className="mt-3 text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
            >
              <RefreshCw size={12} /> Reset filters
            </button>
          </div>
        ) : (
          /* Interactive Orders Container */
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/80"
              >
                <OrderCard order={order} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}