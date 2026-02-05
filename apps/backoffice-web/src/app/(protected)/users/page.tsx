'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronRight,
  MapPin,
  Loader2,
  Info,
  Store,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { useOutletStore } from '@/features/outlets/outlet.store';

// --- Components ---

const Toast = ({ message, visible }: { message: string; visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: -20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: -20, x: '-50%' }}
        className="fixed top-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xl"
      >
        <Info size={14} className="text-emerald-400" />
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
    return outlets.filter(
      (o) =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        (o.branch && o.branch.toLowerCase().includes(search.toLowerCase()))
    );
  }, [outlets, search]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <Loader2 size={40} className="text-emerald-500" />
        </motion.div>
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
          Loading Directory...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Toast message={toast.msg} visible={toast.show} />

        {/* HEADER + SEARCH */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Outlet Management
            </h1>
            
          </div>

          {/* SEARCH (beside title) */}
          <div className="relative w-full max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </motion.div>

        {/* LIST */}
        <motion.div layout className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filteredOutlets.map((o) => (
              <motion.div
                key={o.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -2 }}
                className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                {/* INFO */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Store size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{o.name}</h3>
                    <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500">
                      <MapPin size={11} />
                      {o.branch ?? 'Main Branch'}
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/users/${o.id}/stock`)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase text-slate-600 hover:bg-slate-50"
                  >
                    <Package size={14} />
                    Stock
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/users/${o.id}/products`)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase text-slate-600 hover:bg-slate-50"
                  >
                    <ShoppingBag size={14} />
                    Products
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      showToast(`Loading ${o.name}...`);
                      router.push(`/users/${o.id}`);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 px-4 py-2 text-[11px] font-bold uppercase text-white shadow-md shadow-emerald-500/20"
                  >
                    Manage
                    <ChevronRight size={14} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* EMPTY */}
          {filteredOutlets.length === 0 && (
            <div className="py-10 text-center">
              <Store size={40} className="mx-auto text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-500">
                No outlets match your search.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}