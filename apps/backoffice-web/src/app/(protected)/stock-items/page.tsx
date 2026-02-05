'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from "framer-motion";
import { Plus, Search, RefreshCw, Box } from "lucide-react";
import { StockItemsAPI } from '@/features/stock-items/stockItems.api';
import { StockItem } from '@/features/stock-items/stockItems.types';
import StockItemsTable from './components/StockItemsTable';
import CreateStockItemModal from './components/CreateStockItemModal';

export default function StockItemsPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [search, setSearch] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await StockItemsAPI.getAll();
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  if (loading && items.length === 0) return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <RefreshCw size={40} className="text-emerald-500" />
      </motion.div>
      <p className="mt-4 text-sm font-semibold text-slate-500">Syncing Inventory...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-2 md:p-4 font-sans">
      
      {/* --- HEADER SECTION --- */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Stock Items</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="flex w-64 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
            <Search size={18} className="text-slate-400" />
            <input 
              placeholder="Search items..." 
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Create Button */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-emerald-300 hover:from-emerald-500 hover:to-emerald-700 active:scale-95"
            onClick={() => setOpenCreate(true)}
          >
            <Plus size={20} strokeWidth={2.5} /> <span className="hidden sm:inline">Create Stock Item</span>
          </motion.button>
        </div>
      </div>

      {/* --- MAIN CONTENT CARD --- */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
          <h3 className="text-base font-bold text-slate-800">Inventory List</h3>
          <button 
            onClick={fetchItems} 
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-emerald-500"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="p-0">
          <StockItemsTable
            data={filteredItems}
            loading={loading}
            onRefresh={fetchItems}
          />
        </div>
      </motion.div>

      {/* --- MODAL --- */}
      <CreateStockItemModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={fetchItems}
      />
    </div>
  );
}