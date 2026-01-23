"use client";

import React, { useEffect, useState } from "react";
import { InventoryAPI } from "../api/inventory.api";
import { InventoryItem, InventoryTransaction } from "../types/inventory.types";
import { X, History, ArrowUpRight, ArrowDownLeft, Minus, ArrowRightLeft, PackageOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// 🔴 FIX: We extend the type here to allow 'stockName' without error
interface Props {
  item: InventoryItem & { stockName?: string }; 
  onClose: () => void;
}

export default function InventoryTransactionsModal({ item, onClose }: Props) {
  const [logs, setLogs] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    InventoryAPI.getTransactions(item.stockItemId)
      .then((res) => {
        setLogs(res.data.data);
      })
      .catch((err) => console.error("Failed to load logs", err))
      .finally(() => setLoading(false));
  }, [item.stockItemId]);

  const getLogDetails = (type: string) => {
    if (type.includes('ADD')) return { 
       icon: <ArrowUpRight size={18} />, 
       color: "text-emerald-600", 
       bg: "bg-emerald-500/10",
       border: "border-emerald-200/50"
    };
    if (type.includes('TRANSFER')) return { 
       icon: <ArrowRightLeft size={18} />, 
       color: "text-amber-600", 
       bg: "bg-amber-500/10",
       border: "border-amber-200/50"
    };
    if (type.includes('ADJUST')) return { 
       icon: <Minus size={18} />, 
       color: "text-blue-600", 
       bg: "bg-blue-500/10",
       border: "border-blue-200/50"
    };
    return { 
       icon: <ArrowDownLeft size={18} />, 
       color: "text-red-600", 
       bg: "bg-red-500/10",
       border: "border-red-200/50"
    };
  };

  return (
    <div 
       className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm" 
       onClick={onClose}
    >
      <motion.div 
        initial={{ x: "100%" }} 
        animate={{ x: 0 }} 
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="h-full w-full max-w-md border-l border-border bg-background shadow-2xl sm:w-[480px]"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Transaction History</h2>
              {/* NOW WORKING: Typescript knows stockName is allowed */}
              <p className="font-mono text-xs text-muted-foreground mt-0.5">
                {item.stockName || item.stockItemId}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="h-[calc(100vh-100px)] overflow-y-auto p-6">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 size={32} className="animate-spin text-primary mb-3" />
                <p>Loading history...</p>
             </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
               <div className="mb-4 rounded-full bg-muted p-4">
                 <PackageOpen size={32} className="text-muted-foreground/50" />
               </div>
               <p className="font-medium text-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {logs.map((log) => {
                const details = getLogDetails(log.type);
                const isPositive = log.type.includes('ADD');
                
                return (
                  <div 
                    key={log.id} 
                    className={`flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all hover:shadow-sm ${details.border}`}
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${details.bg} ${details.color}`}>
                      {details.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-bold text-foreground">
                        {log.type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(log.createdAt).toLocaleDateString()} 
                        <span className="mx-1">•</span>
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className={`text-right font-bold ${details.color}`}>
                      <div className="text-lg leading-none">
                         {isPositive ? '+' : '-'}{log.quantity.value}
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                         {item.unit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}