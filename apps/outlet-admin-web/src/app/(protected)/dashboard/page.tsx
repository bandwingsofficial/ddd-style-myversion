'use client';

import { useSessionGuard } from '@/features/auth/hooks/useSession';
import { useOrders } from '../../../features/orders/hooks/useOrders';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, AlertCircle, Clock, Filter, Calendar, X, ListChecks } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type DateFilter = 'TODAY' | 'YESTERDAY' | 'WEEK' | '15_DAYS' | 'MONTH' | 'ALL';
type StatusFilter = 'ALL' | 'DELIVERED' | 'CANCELLED' | 'NEW' | 'PREPARING';

export default function DashboardPage() {
  const { loading: sessionLoading } = useSessionGuard();
  const { columns, loading: ordersLoading } = useOrders();

  const [dateFilter, setDateFilter] = useState<DateFilter>('WEEK');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const { stats, chartPoints, recentActivity } = useMemo(() => {
    if (!columns) return { stats: { revenue: 0, orders: 0, pending: 0 }, chartPoints: [], recentActivity: [] };

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

    // Stats Calculation - Updated to include PAYMENT_PENDING in pending count
    const revenue = filtered.reduce((sum, o) => String(o.status) === 'DELIVERED' ? sum + o.grandTotal : sum, 0);
    const pendingCount = filtered.filter(o => 
      ['NEW', 'PREPARING', 'PAYMENT_PENDING'].includes(String(o.status))
    ).length;

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

    // FEATURE REPLACEMENT: Recent Activity (Top 6 latest orders)
    const sortedActivity = [...filtered]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    return {
      stats: { revenue, orders: filtered.length, pending: pendingCount },
      chartPoints: points,
      recentActivity: sortedActivity
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

        {/* NEW FEATURE: Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
              <p className="text-[13px] text-slate-400 mt-0.5">Latest order updates</p>
            </div>
            <ListChecks size={20} className="text-slate-300" />
          </div>

          <div className="flex flex-col gap-4">
            {recentActivity.length > 0 ? recentActivity.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100 transition-all hover:border-blue-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-emerald-500' :
                    order.status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-[12px] font-black text-slate-800 uppercase tracking-tight">{order.orderNumber}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{order.customerFullName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-black text-slate-900">₹{order.grandTotal}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{order.status}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-slate-400 text-sm italic">
                No recent activity found.
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