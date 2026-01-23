'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, MapPin, Loader2, Info, Store, Package, ShoppingBag } from 'lucide-react';
import { useOutletStore } from '@/features/outlets/outlet.store';

// --- Components ---
const Toast = ({ message, visible }: { message: string; visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: -20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: -20, x: '-50%' }}
        className="fixed top-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/10"
      >
        <Info size={16} className="text-emerald-400" />
        {message}
      </motion.div>
    )}
  </AnimatePresence>
);

export default function UsersOutletSelectPage() {
  const router = useRouter();
  const { outlets, fetchOutlets, loading } = useOutletStore();
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ show: false, msg: '' });

  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 2500);
  };

  const filteredOutlets = useMemo(() => {
    return outlets.filter((o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      (o.branch && o.branch.toLowerCase().includes(search.toLowerCase()))
    );
  }, [outlets, search]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader2 size={40} className="text-emerald-500" />
        </motion.div>
        <p className="mt-4 font-medium text-slate-500 animate-pulse">Loading Directory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans md:p-10">
      <div className="mx-auto max-w-5xl">
        <Toast message={toast.msg} visible={toast.show} />

        {/* HEADER */}
        <header className="mb-8">
          <motion.div 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col gap-1"
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Outlet Operations
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Select an outlet to manage users, stock, or products
            </p>
          </motion.div>
        </header>

        {/* SEARCH BAR */}
        <div className="mb-8">
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search size={18} className="text-slate-400 transition-colors group-focus-within:text-emerald-500" />
            </div>
            <input
              type="text"
              placeholder="Search by name or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-11 pr-4 text-base font-medium text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {/* LIST SECTION */}
        <motion.div 
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          <AnimatePresence mode='popLayout'>
            {filteredOutlets.map((o) => (
              <motion.div
                key={o.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -2 }}
                className="group relative flex flex-col items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md md:flex-row md:items-center"
              >
                
                {/* Card Info */}
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{o.name}</h3>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <MapPin size={12} />
                      <span>{o.branch ?? 'Main Branch'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex w-full flex-wrap gap-3 md:w-auto">
                  
                  {/* Stock Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/users/${o.id}/stock`)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 md:flex-none"
                  >
                    <Package size={16} />
                    Stock
                  </motion.button>

                  {/* NEW: Products Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/users/${o.id}/products`)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 md:flex-none"
                  >
                    <ShoppingBag size={16} />
                    Products
                  </motion.button>

                  {/* Users (Manage) Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      showToast(`Accessing Users for ${o.name}...`);
                      router.push(`/users/${o.id}`);
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 md:flex-none"
                  >
                    Users
                    <ChevronRight size={16} />
                  </motion.button>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>

          {filteredOutlets.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="py-12 text-center"
            >
              <div className="mb-3 flex justify-center text-slate-300">
                <Store size={48} />
              </div>
              <p className="text-base font-medium text-slate-500">No outlets match your search.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}