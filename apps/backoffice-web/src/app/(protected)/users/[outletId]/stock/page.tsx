'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Loader2, Scale, Tag, Store, AlertCircle } from 'lucide-react';
import { UsersService } from '@/features/users/users.service';
import { axiosInstance } from '@/http/axios';

interface StockItem {
  id: string;
  stockItemId: string;
  unit: string;
  quantity: {
    value: number;
  };
  updatedAt: string;
}

interface MasterStockItem {
  id: string;
  name: string;
}

export default function OutletStockPage() {
  const router = useRouter();
  const params = useParams();
  const outletId = params?.outletId as string;

  const [stock, setStock] = useState<StockItem[]>([]);
  const [itemNames, setItemNames] = useState<Record<string, string>>({});
  const [outletName, setOutletName] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (outletId) {
      loadData();
    }
  }, [outletId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch Outlet Stock
      const stockPromise = UsersService.getOutletStock(outletId);
      
      // 2. Fetch Master Stock Items (for mapping IDs to Names)
      const masterListPromise = axiosInstance.get('/stock-items'); 

      // 3. Fetch Outlet Details
      const outletPromise = axiosInstance.get(`/outlets/${outletId}`);

      const [stockRes, masterRes, outletRes] = await Promise.all([
        stockPromise, 
        masterListPromise,
        outletPromise
      ]);

      // --- Process Data ---
      setStock(stockRes.data.data || []);

      const masterItems: MasterStockItem[] = masterRes.data.data || [];
      const nameMap: Record<string, string> = {};
      masterItems.forEach(item => {
        nameMap[item.id] = item.name;
      });
      setItemNames(nameMap);

      const outletData = outletRes.data.data || outletRes.data;
      setOutletName(outletData.name || 'Unknown Outlet');

    } catch (err: any) {
      console.error("Data fetch error:", err);
      const errMsg = err.response?.data?.message || 'Failed to load data.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get name from ID
  const getItemName = (id: string) => {
    return itemNames[id] || id; // Show ID if name not found
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2 font-sans md:p-4">
      <div className="mx-auto max-w-5xl">
        
        {/* HEADER */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Directory
          </button>

          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
              <Store size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                {loading ? 'Loading Outlet...' : outletName}
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Stock Inventory Management
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT CARD */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          
          {/* LOADING STATE */}
          {loading && (
            <div className="flex h-96 flex-col items-center justify-center text-slate-400">
              <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
              <p className="text-sm font-medium">Loading inventory...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="flex h-96 flex-col items-center justify-center text-center p-8">
              <div className="mb-4 rounded-full bg-red-50 p-3 text-red-500">
                <AlertCircle size={32} />
              </div>
              <p className="mb-4 font-medium text-slate-900">{error}</p>
              <button 
                onClick={loadData} 
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && stock.length === 0 && (
            <div className="flex h-96 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-slate-50 p-4 text-slate-300">
                <Package size={40} />
              </div>
              <p className="font-medium text-slate-500">No stock items found for {outletName}.</p>
            </div>
          )}

          {/* TABLE DATA */}
          {!loading && !error && stock.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Stock Name</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Unit</th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stock.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      {/* 1. Mapped Name */}
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {getItemName(item.stockItemId)}
                      </td>

                      {/* 2. Unit */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 uppercase tracking-wide">
                          <Tag size={12} />
                          {item.unit}
                        </span>
                      </td>

                      {/* 3. Available Quantity */}
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-600 border border-emerald-100">
                          <Scale size={14} />
                          {item.quantity?.value ?? item.quantity}
                        </div>
                      </td>

                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}