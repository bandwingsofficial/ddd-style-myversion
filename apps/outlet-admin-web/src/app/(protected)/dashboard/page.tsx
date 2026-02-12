'use client';

import { useSessionGuard } from '@/features/auth/hooks/useSession';
import { useOrders } from '../../../features/orders/hooks/useOrders';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, AlertCircle, Clock, Filter, Calendar, X, Package } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DateFilter = 'TODAY' | 'YESTERDAY' | 'WEEK' | '15_DAYS' | 'MONTH' | 'ALL';
type StatusFilter = 'ALL' | 'DELIVERED' | 'CANCELLED' | 'NEW' | 'PREPARING';

interface ProductStat {
  name: string;
  count: number;
}

export default function DashboardPage() {
  const { loading: sessionLoading } = useSessionGuard();
  const { columns, loading: ordersLoading } = useOrders();

  const [dateFilter, setDateFilter] = useState<DateFilter>('WEEK');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const { stats, chartPoints, topProducts } = useMemo(() => {
    if (!columns) return { stats: { revenue: 0, orders: 0, pending: 0 }, chartPoints: [], topProducts: [] };

    const allOrders = Object.values(columns).flat();
    const now = new Date();
    
    const applyDateFilter = (o: any) => {
      const orderDate = new Date(o.createdAt);
      const diffInDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);

      if (dateFilter === 'TODAY') return orderDate.toDateString() === now.toDateString();
      if (dateFilter === 'YESTERDAY') {
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        return orderDate.toDateString() === yesterday.toDateString();
      }
      if (dateFilter === 'WEEK') return diffInDays <= 7;
      if (dateFilter === '15_DAYS') return diffInDays <= 15;
      if (dateFilter === 'MONTH') return diffInDays <= 30;
      return true; 
    };

    const applyStatusFilter = (o: any) => statusFilter === 'ALL' || String(o.status) === statusFilter;

    const filtered = allOrders.filter(o => applyDateFilter(o) && applyStatusFilter(o));

    // Stats Calculation
    const revenue = filtered.reduce((sum, o) => String(o.status) === 'DELIVERED' ? sum + o.grandTotal : sum, 0);
    const pendingCount = filtered.filter(o => String(o.status) === 'NEW' || String(o.status) === 'PREPARING').length;

    // Chart Points Calculation
    const range = dateFilter === 'MONTH' ? 30 : dateFilter === '15_DAYS' ? 15 : 7;
    const points = Array.from({ length: range }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - i);
      
      const dayRevenue = allOrders
        .filter(o => new Date(o.createdAt).toDateString() === d.toDateString() && String(o.status) === 'DELIVERED')
        .reduce((sum, o) => sum + o.grandTotal, 0);

      return {
        name: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        sales: dayRevenue,
      };
    }).reverse();

    // Top Products Calculation
    const productMap: Record<string, number> = {};
    filtered.forEach((order: any) => {
      // Only count products from valid/delivered orders if you prefer, 
      // but here we use the filtered list based on your UI selection
      order.items?.forEach((item: any) => {
        const pName = item.productName || 'Unknown Product';
        productMap[pName] = (productMap[pName] || 0) + (item.quantity || 1);
      });
    });

    const sortedProducts = Object.entries(productMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 products

    return {
      stats: { revenue, orders: filtered.length, pending: pendingCount },
      chartPoints: points,
      topProducts: sortedProducts
    };
  }, [columns, dateFilter, statusFilter]);

  if (sessionLoading || ordersLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Clock size={32} className="text-slate-400" />
        </motion.div>
        <p className="text-slate-500 font-medium">Syncing Live Data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="mb-6 flex flex-wrap justify-between items-center gap-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Outlet Insights</h1>
          <p className="text-sm text-slate-500">Analyzing real-time performance</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Calendar size={14} className="text-slate-500" />
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value as DateFilter)} 
              className="bg-transparent border-none outline-none text-[13px] font-semibold text-slate-700 cursor-pointer"
            >
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="WEEK">This Week</option>
              <option value="15_DAYS">Last 15 Days</option>
              <option value="MONTH">This Month</option>
              <option value="ALL">All Time</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
            <Filter size={14} className="text-slate-500" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} 
              className="bg-transparent border-none outline-none text-[13px] font-semibold text-slate-700 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NEW">New</option>
              <option value="PREPARING">Preparing</option>
            </select>
          </div>
          
          {(dateFilter !== 'WEEK' || statusFilter !== 'ALL') && (
            <button 
              onClick={() => {setDateFilter('WEEK'); setStatusFilter('ALL')}} 
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Revenue" value={`₹${stats?.revenue.toLocaleString('en-IN')}`} icon={<TrendingUp size={20} />} color="emerald" />
        <StatCard title="Orders Found" value={stats?.orders.toString()} icon={<ShoppingBag size={20} />} color="blue" />
        <StatCard title="Needs Attention" value={stats?.pending.toString()} icon={<AlertCircle size={20} />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900">Sales Trend</h3>
            <p className="text-[13px] text-slate-400 mt-1">Daily delivered revenue performance</p>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartPoints}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                   formatter={(v: number) => [`₹${v}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Section */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Best Sellers</h3>
              <p className="text-[13px] text-slate-400 mt-0.5">Most ordered items in this period</p>
            </div>
            <Package size={20} className="text-slate-300" />
          </div>

          <div className="flex flex-col gap-5">
            {topProducts.length > 0 ? topProducts.map((product, index) => {
              // Calculate simple percentage for the progress bar relative to the top seller
              const maxCount = topProducts[0].count;
              const percentage = (product.count / maxCount) * 100;

              return (
                <div key={product.name} className="group">
                  <div className="flex justify-between items-end mb-1.5">
                    <p className="text-[13px] font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                      {index + 1}. {product.name}
                    </p>
                    <span className="text-[12px] font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md">
                      {product.count} <span className="text-[10px] text-slate-400 font-medium">Sold</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-blue-500 h-full rounded-full"
                    />
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-20 text-slate-400 text-sm italic">
                No product data available for these filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
    const colorMap: Record<string, string> = {
      emerald: 'bg-emerald-50 text-emerald-500',
      blue: 'bg-blue-50 text-blue-500',
      amber: 'bg-amber-50 text-amber-500'
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        whileHover={{ scale: 1.01 }} 
        className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-4"
      >
        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">{title}</p>
          <h4 className="text-2xl font-black text-slate-900 leading-tight">{value || '0'}</h4>
        </div>
      </motion.div>
    );
}