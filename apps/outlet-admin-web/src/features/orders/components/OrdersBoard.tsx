'use client';
import React, { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { Order } from '../types';

export const OrdersTable = () => {
  const { columns, loading, handleStatusChange, refresh } = useOrders();
  const [activeTab, setActiveTab] = useState<'NEW' | 'PREPARING' | 'DISPATCH' | 'COMPLETED'>('NEW');

  if (loading) return <div className="p-8 text-center text-gray-500">Loading live orders...</div>;

  // Map the active tab to the correct data source from your hook
  const currentOrders = columns[activeTab] || [];

  const tabs = [
    { id: 'NEW', label: 'New Orders', count: columns.NEW.length, color: 'text-blue-600 bg-blue-50' },
    { id: 'PREPARING', label: 'In Kitchen', count: columns.PREPARING.length, color: 'text-amber-600 bg-amber-50' },
    { id: 'DISPATCH', label: 'Out for Delivery', count: columns.DISPATCH.length, color: 'text-purple-600 bg-purple-50' },
    { id: 'COMPLETED', label: 'History', count: columns.COMPLETED.length, color: 'text-gray-600 bg-gray-50' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header & Refresh */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
        <button 
          onClick={refresh} 
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2">
          <span>↻ Refresh List</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 
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
                {/* Width adjusted for Order Number string */}
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[160px]">Order Info</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[180px]">Date & Time</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[120px]">Total</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[200px]">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <TableRow 
                    key={order.id} 
                    order={order} 
                    activeTab={activeTab} 
                    onAction={handleStatusChange} 
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 italic">
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

// --- Sub-component for individual rows ---
const TableRow = ({ order, activeTab, onAction }: { order: Order; activeTab: string; onAction: any }) => {
  return (
    <tr className="hover:bg-blue-50/30 transition-colors group">
      {/* Order Info (Number + Customer Name) */}
      <td className="p-4 align-top">
        <div className="font-bold text-sm text-gray-900">{order.orderNumber}</div>
        <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-tight">
          👤 {order.customerFullName}
        </div>
      </td>

      {/* Time */}
      <td className="p-4 align-top">
        <div className="text-sm font-medium text-gray-700">
          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {new Date(order.createdAt).toLocaleDateString()}
        </div>
      </td>

      {/* Items */}
      <td className="p-4 align-top">
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="text-sm text-gray-700">
              <span className="font-bold text-gray-900 mr-2">{item.quantity}x</span>
              {item.productName}
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            📍 {order.address.addressText}
        </div>
      </td>

      {/* Amount & Status Badge */}
      <td className="p-4 align-top">
        <div className="text-sm font-bold text-gray-800">₹{order.grandTotal}</div>
        <div className={`text-xs inline-block px-1.5 rounded mt-1 font-bold ${
            order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
            order.status === 'PREPARING' ? 'bg-amber-100 text-amber-700' :
            'bg-emerald-50 text-emerald-600'
        }`}>
            {order.status}
        </div>
      </td>

      {/* Actions (Dynamic based on Tab) */}
      <td className="p-4 align-top">
        {activeTab === 'NEW' && (
          <div className="flex gap-2">
            <button 
              onClick={() => onAction(order.id, 'accept')}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded shadow-sm hover:bg-emerald-700">
              ACCEPT
            </button>
            <button 
              onClick={() => onAction(order.id, 'reject')}
              className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded hover:bg-red-50">
              REJECT
            </button>
          </div>
        )}

        {/* FIXED LOGIC: Handles the 2-step Kitchen Process */}
        {activeTab === 'PREPARING' && (
          <div>
            {order.status === 'CONFIRMED' ? (
                <button 
                    onClick={() => onAction(order.id, 'prepare')}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2">
                    Start Cooking 👨‍🍳
                </button>
            ) : (
                <button 
                    onClick={() => onAction(order.id, 'deliver')}
                    className="w-full px-3 py-2 bg-amber-500 text-white text-xs font-bold rounded hover:bg-amber-600 shadow-sm flex items-center justify-center gap-2">
                    Ready & Dispatch 🚀
                </button>
            )}
          </div>
        )}

        {activeTab === 'DISPATCH' && (
          <button 
            onClick={() => onAction(order.id, 'complete')}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">
            Mark Delivered
          </button>
        )}

        {activeTab === 'COMPLETED' && (
          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded">
            {order.status}
          </span>
        )}
      </td>
    </tr>
  );
};