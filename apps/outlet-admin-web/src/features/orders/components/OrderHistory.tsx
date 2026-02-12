'use client';
import React, { useState, useMemo } from 'react';
import { useOrders } from '../hooks/useOrders';
import { Order } from '../types';
import { Search, X } from 'lucide-react'; // Using icons for a better look

export const OrderHistory = () => {
  const { columns, loading, refresh } = useOrders();
  
  // State for Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('ALL');

  // 1. Flatten all orders from your columns object safely
  const allOrders = useMemo(() => {
    if (!columns) return [];
    return Object.values(columns)
      .flat()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [columns]);

  // 2. Multi-Intent Filter Logic
  const filteredOrders = useMemo(() => {
    const now = new Date();

    return allOrders.filter(order => {
      // --- UPDATED SEARCH LOGIC ---
      // Checks ID, Customer ID, Product Names, and Amount
      const searchLower = searchTerm.toLowerCase();
      
      const matchesId = order.id.toLowerCase().includes(searchLower);
      const matchesCustomerId = order.customerId.toLowerCase().includes(searchLower);
      const matchesAmount = order.grandTotal.toString().includes(searchTerm);
      const matchesProducts = order.items.some(item => 
        item.productName.toLowerCase().includes(searchLower)
      );

      const matchesSearch = searchTerm === '' || 
                            matchesId || 
                            matchesCustomerId || 
                            matchesAmount || 
                            matchesProducts;
      
      // Status Logic
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      
      // Date Range Logic
      let matchesDate = true;
      const orderDate = new Date(order.createdAt);
      const diffInDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);

      if (dateRange === 'TODAY') {
        matchesDate = orderDate.toDateString() === now.toDateString();
      } else if (dateRange === '1_WEEK') {
        matchesDate = diffInDays <= 7;
      } else if (dateRange === '15_DAYS') {
        matchesDate = diffInDays <= 15;
      } else if (dateRange === '1_MONTH') {
        matchesDate = diffInDays <= 30;
      } else if (dateRange === '1_YEAR') {
        matchesDate = diffInDays <= 365;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [allOrders, searchTerm, statusFilter, dateRange]);

  // 3. Calculate Totals
  const stats = useMemo(() => {
    return {
      total: filteredOrders.length,
      revenue: filteredOrders.reduce((sum, o) => {
        return String(o.status) === 'DELIVERED' ? sum + (o.grandTotal || 0) : sum;
      }, 0),
      deliveredCount: filteredOrders.filter(o => String(o.status) === 'DELIVERED').length
    };
  }, [filteredOrders]);

  if (loading) return <div className="p-8 text-center text-gray-500 italic">Gathering history records...</div>;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order History</h1>
          <p className="text-sm text-gray-500">Comprehensive log of all store transactions</p>
        </div>
        <button 
          onClick={refresh} 
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        >
          <span>↻ Refresh Data</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Total Volume</p>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Orders in current view</p>
        </div>
        <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm border-t-4 border-t-emerald-500">
          <p className="text-[10px] text-emerald-600 uppercase tracking-widest font-bold mb-1">Delivered Revenue</p>
          <p className="text-3xl font-black text-emerald-600">₹{stats.revenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500 mt-1">Earnings from delivered orders</p>
        </div>
        <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm border-t-4 border-t-blue-500">
          <p className="text-[10px] text-blue-600 uppercase tracking-widest font-bold mb-1">Delivered</p>
          <p className="text-3xl font-black text-blue-600">{stats.deliveredCount}</p>
          <p className="text-xs text-gray-500 mt-1">Successfully reached customer</p>
        </div>
      </div>

      {/* --- REFINED FILTER BAR --- */}
      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-wrap gap-4 items-end shadow-inner">
        
        {/* Universal Search Input */}
        <div className="flex-1 min-w-[300px] relative">
          <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Universal Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search ID, Product, or Amount..." 
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="w-[180px]">
          <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Status Filter</label>
          <select 
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none cursor-pointer hover:border-gray-300 shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="DISPATCH">In Transit</option>
            <option value="PREPARING">Preparing</option>
            <option value="NEW">New</option>
          </select>
        </div>

        <div className="w-[180px]">
          <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase ml-1">Time Range</label>
          <select 
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none cursor-pointer hover:border-gray-300 shadow-sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="1_WEEK">Last 7 Days</option>
            <option value="15_DAYS">Last 15 Days</option>
            <option value="1_MONTH">Last 30 Days</option>
            <option value="1_YEAR">Last 1 Year</option>
          </select>
        </div>
        
        <button 
          onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); setDateRange('ALL'); }}
          className="px-4 py-2.5 text-xs text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* History Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Order Reference</th>
                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Date & Time</th>
                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Order Items</th>
                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-right">Grand Total</th>
                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Final Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <HistoryRow key={order.id} order={order} />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">empty</span>
                      <p className="text-gray-400 italic text-sm">No historical records found for this period.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const HistoryRow = ({ order }: { order: Order }) => {
  const statusColors: Record<string, string> = {
    DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-600 border-red-100',
    DISPATCH: 'bg-purple-100 text-purple-700 border-purple-200',
    PREPARING: 'bg-amber-100 text-amber-700 border-amber-200',
    NEW: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <tr className="hover:bg-emerald-50/20 transition-colors group">
      <td className="p-4">
        <div className="font-mono text-xs font-bold text-gray-800">#{order.id.slice(-8).toUpperCase()}</div>
        <div className="text-[10px] text-emerald-600 font-medium">UID: {order.customerId.slice(0, 8)}</div>
      </td>
      <td className="p-4">
        <div className="text-sm font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <div className="text-[11px] text-gray-400 font-medium">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </td>
      <td className="p-4">
        <div className="text-sm text-gray-600 max-w-[300px] truncate group-hover:whitespace-normal transition-all">
          {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
        </div>
        <div className="text-[10px] text-gray-400 mt-1 italic">
           {order.address.addressText.slice(0, 40)}...
        </div>
      </td>
      <td className="p-4 text-right">
        <div className="text-sm font-black text-gray-900">₹{order.grandTotal.toLocaleString('en-IN')}</div>
        <div className="text-[10px] text-gray-400">Paid Online</div>
      </td>
      <td className="p-4 text-center">
        <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tight shadow-sm ${statusColors[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {order.status}
        </span>
      </td>
    </tr>
  );
};