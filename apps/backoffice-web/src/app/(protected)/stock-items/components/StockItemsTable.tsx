'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Box, CheckCircle, XCircle } from 'lucide-react';
import { StockItem } from '@/features/stock-items/stockItems.types';
import { StockItemsAPI } from '@/features/stock-items/stockItems.api';

interface Props {
  data: StockItem[];
  loading: boolean;
  onRefresh: () => void;
}

export default function StockItemsTable({ data, loading, onRefresh }: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead className="bg-slate-50/80">
          <tr>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Item Details</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Unit</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {data.map((item) => {
              const isActive = item.status === 'ACTIVE';
              return (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={item.id} 
                  className={`
                    transition-colors hover:bg-slate-50/50 
                    ${isActive ? "bg-white" : "bg-slate-50/60 grayscale-[0.5]"}
                  `}
                >
                  {/* --- ITEM DETAILS --- */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                         <Box size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{item.name}</div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          ID: {item.id.slice(-6).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* --- UNIT --- */}
                  <td className="px-6 py-4 align-middle">
                    <span className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {item.unit}
                    </span>
                  </td>

                  {/* --- STATUS --- */}
                  <td className="px-6 py-4 align-middle">
                    <span className={`
                      inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide border
                      ${isActive 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : "bg-slate-100 text-slate-500 border-slate-200"
                      }
                    `}>
                      <div className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {item.status}
                    </span>
                  </td>

                  {/* --- ACTIONS --- */}
                  <td className="px-6 py-4 align-middle">
                    {isActive ? (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-lg border border-rose-100 bg-white px-3 py-1.5 text-[10px] font-bold text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                        onClick={async () => { await StockItemsAPI.disable(item.id); onRefresh(); }}
                      >
                        DISABLE
                      </motion.button>
                    ) : (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm shadow-emerald-200 hover:bg-emerald-600 transition-all"
                        onClick={async () => { await StockItemsAPI.enable(item.id); onRefresh(); }}
                      >
                        ACTIVATE
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
          
          {/* Empty State */}
          {data.length === 0 && (
            <tr>
              <td colSpan={4} className="py-12 text-center text-slate-400 text-sm font-medium">
                No stock items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}