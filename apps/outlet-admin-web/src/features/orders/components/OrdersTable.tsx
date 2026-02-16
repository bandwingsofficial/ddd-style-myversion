'use client';
import React, { useState, useEffect } from 'react';
import { useOrders } from '../hooks/useOrders';
import { fetchOrderById } from '../api/orders'; // Assuming the service we discussed
import { Order } from '../types';
import { RotateCw, User, MapPin, ShoppingBag } from 'lucide-react';

export const OrdersTable = () => {
  const { columns, loading, handleStatusChange, refresh } = useOrders();
  const [activeTab, setActiveTab] = useState<'NEW' | 'PREPARING' | 'DISPATCH' | 'COMPLETED'>('NEW');

  if (loading) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <RotateCw className="animate-spin text-emerald-500" size={40} />
        <p className="text-gray-500 italic animate-pulse">Loading live orders...</p>
      </div>
    );
  }

  // Map the active tab to the correct data source from your hook
  const currentOrders = columns[activeTab] || [];

  const tabs = [
    { id: 'NEW', label: 'New Orders', count: columns.NEW.length },
    { id: 'PREPARING', label: 'In Progress', count: columns.PREPARING.length },
    { id: 'DISPATCH', label: 'Out for Delivery', count: columns.DISPATCH.length },
    { id: 'COMPLETED', label: 'History', count: columns.COMPLETED.length },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header & Refresh */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <button 
          onClick={refresh} 
          className="text-sm font-semibold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
        >
          <RotateCw size={16} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 
              ${activeTab === tab.id 
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider w-[180px]">Order Info</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider w-[150px]">Date & Time</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Items & Address</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider w-[120px]">Total Bill</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider w-[220px]">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <TableRow 
                    key={order.id} 
                    initialOrder={order} 
                    activeTab={activeTab} 
                    onAction={handleStatusChange} 
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-24 text-center text-gray-400 italic font-medium">
                    No orders found in this section.
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

// --- Sub-component for individual rows with Lazy Loading ---
const TableRow = ({ initialOrder, activeTab, onAction }: { initialOrder: Order; activeTab: string; onAction: any }) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isFetching, setIsFetching] = useState(false);

  // Lazy load product details and address because summary API doesn't provide them
  useEffect(() => {
    const loadFullDetails = async () => {
      // Only fetch if items or address are missing
      if (!initialOrder.items || initialOrder.items.length === 0 || !initialOrder.address) {
        setIsFetching(true);
        try {
          const detailedOrder = await fetchOrderById(initialOrder.id);
          setOrder(detailedOrder);
        } catch (err) {
          console.error("Error fetching order details for table:", err);
        } finally {
          setIsFetching(false);
        }
      }
    };
    loadFullDetails();
  }, [initialOrder]);

  return (
    <tr className="hover:bg-blue-50/30 transition-colors group">
      {/* Order Info */}
      <td className="p-4 align-top">
        <div className="font-bold text-sm text-gray-900">{order.orderNumber || 'N/A'}</div>
        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-tight">
          <User size={12} /> {order.customerFullName || 'Unknown'}
        </div>
      </td>

      {/* Time */}
      <td className="p-4 align-top">
        <div className="text-sm font-bold text-gray-700">
          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </div>
        <div className="text-[11px] text-gray-400 font-medium">
          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'No date'}
        </div>
      </td>

      {/* Items & Address with Loading State */}
      <td className="p-4 align-top">
        {isFetching ? (
          <div className="flex items-center gap-2 text-[10px] text-blue-500 font-black animate-pulse">
            <RotateCw size={10} className="animate-spin" /> FETCHING ITEMS...
          </div>
        ) : (
          <div className="space-y-2">
            {/* Products */}
            <div className="space-y-1">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.id} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="font-black text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                      {item.quantity}x
                    </span>
                    <span className="font-medium">{item.productName}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <ShoppingBag size={14} className="text-gray-400" />
                  <span className="font-medium">{order.itemCount} Items in Order</span>
                </div>
              )}
            </div>
            
            {/* Address */}
            <div className="flex items-start gap-1.5 border-t border-gray-50 pt-1.5">
               <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5" />
               <div className="text-[11px] text-gray-500 font-medium leading-relaxed italic">
                  {order.address?.addressText || 'No address provided'}
               </div>
            </div>
          </div>
        )}
      </td>

      {/* Amount & Status Badge */}
      <td className="p-4 align-top">
        <div className="text-sm font-black text-gray-800">₹{order.grandTotal}</div>
        <div className={`text-[10px] inline-block px-2 py-0.5 rounded mt-2 font-black uppercase tracking-widest ${
            order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
            order.status === 'PREPARING' ? 'bg-amber-100 text-amber-700' :
            order.status === 'PAYMENT_PENDING' ? 'bg-gray-100 text-gray-500' :
            'bg-emerald-50 text-emerald-600'
        }`}>
            {order.status}
        </div>
      </td>

      {/* Actions */}
      <td className="p-4 align-top">
        {activeTab === 'NEW' && (
          <div className="flex gap-2">
            <button 
              onClick={() => onAction(order.id, 'accept')}
              className="flex-1 px-3 py-2 bg-emerald-600 text-white text-[10px] font-black rounded shadow-sm hover:bg-emerald-700 transition-colors">
              ACCEPT
            </button>
            <button 
              onClick={() => onAction(order.id, 'reject')}
              className="flex-1 px-3 py-2 bg-white border border-red-200 text-red-600 text-[10px] font-black rounded hover:bg-red-50 transition-colors">
              REJECT
            </button>
          </div>
        )}

        {activeTab === 'PREPARING' && (
          <div className="space-y-2">
            {order.status === 'CONFIRMED' || order.status === 'ACCEPTED' ? (
                <button 
                    onClick={() => onAction(order.id, 'prepare')}
                    className="w-full px-3 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 transition-all">
                    START COOKING 👨‍🍳
                </button>
            ) : (
                <button 
                    onClick={() => onAction(order.id, 'deliver')}
                    className="w-full px-3 py-2.5 bg-amber-500 text-white text-[10px] font-black rounded hover:bg-amber-600 shadow-sm flex items-center justify-center gap-2 transition-all">
                    READY & DISPATCH 🚀
                </button>
            )}
          </div>
        )}

        {activeTab === 'DISPATCH' && (
          <button 
            onClick={() => onAction(order.id, 'complete')}
            className="w-full px-4 py-2.5 bg-emerald-600 text-white text-[10px] font-black rounded hover:bg-emerald-700 shadow-md transition-all">
            MARK DELIVERED
          </button>
        )}

        {activeTab === 'COMPLETED' && (
          <span className="w-full block text-center px-2 py-1.5 bg-gray-100 text-gray-500 text-[10px] font-black rounded uppercase">
            {order.status}
          </span>
        )}
      </td>
    </tr>
  );
};