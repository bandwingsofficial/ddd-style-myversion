'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  History,
  Loader2,
  Minus,
  PackageOpen,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { InventoryApi } from '../api/inventory.api';
import {
  InventoryListItem,
  InventoryTransaction,
} from '../types/inventory.types';
import {
  formatTransactionDelta,
  getQuantityValue,
  getTransactionDelta,
  UNEXPECTED_ERROR_TOAST,
} from '../utils/inventory-validation';

interface Props {
  item: InventoryListItem;
  onClose: () => void;
}

function getTransactionLabel(type: string, delta: number): string {
  if (type.includes('TRANSFER')) {
    return delta >= 0 ? 'TRANSFER IN' : 'TRANSFER OUT';
  }

  return type.replace(/_/g, ' ');
}

function getLogDetails(type: string, delta: number) {
  if (type.includes('INITIALIZE') || type.includes('ADD') || delta > 0) {
    return {
      icon: <ArrowUpRight size={18} />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-200/50',
    };
  }

  if (type.includes('TRANSFER')) {
    return {
      icon: <ArrowRightLeft size={18} />,
      color: delta >= 0 ? 'text-emerald-600' : 'text-amber-600',
      bg: delta >= 0 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
      border: delta >= 0 ? 'border-emerald-200/50' : 'border-amber-200/50',
    };
  }

  if (type.includes('ADJUST')) {
    return {
      icon: <Minus size={18} />,
      color: delta >= 0 ? 'text-emerald-600' : 'text-blue-600',
      bg: delta >= 0 ? 'bg-emerald-500/10' : 'bg-blue-500/10',
      border: delta >= 0 ? 'border-emerald-200/50' : 'border-blue-200/50',
    };
  }

  return {
    icon: <ArrowDownLeft size={18} />,
    color: 'text-red-600',
    bg: 'bg-red-500/10',
    border: 'border-red-200/50',
  };
}

export default function InventoryTransactionsModal({ item, onClose }: Props) {
  const [logs, setLogs] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    InventoryApi.getTransactions(item.stockItemId)
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setLogs([]);
        toast.error(UNEXPECTED_ERROR_TOAST);
      })
      .finally(() => setLoading(false));
  }, [item.stockItemId]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-[1px]"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl sm:w-[480px]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <History size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Transaction History
                </h2>
                <p className="text-xs text-muted-foreground">{item.stockName}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 size={28} className="mb-3 animate-spin text-primary" />
                <p className="text-sm">Loading history...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <PackageOpen size={28} className="text-muted-foreground/50" />
                </div>
                <p className="font-medium text-foreground">No transactions found</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {logs.map((log) => {
                  const delta = getTransactionDelta(log);
                  const details = getLogDetails(log.type, delta);

                  return (
                    <div
                      key={log.id}
                      className={`flex items-center gap-4 rounded-xl border bg-card p-4 ${details.border}`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${details.bg} ${details.color}`}
                      >
                        {details.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {getTransactionLabel(log.type, delta)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                        {log.type.includes('ADJUST') && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {getQuantityValue(log.previousQuantity)} →{' '}
                            {getQuantityValue(log.newQuantity)}
                          </p>
                        )}
                        {log.remarks && (
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {log.remarks}
                          </p>
                        )}
                        {log.performedBy && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            By {log.performedBy}
                          </p>
                        )}
                      </div>
                      <div className={`text-right font-bold ${details.color}`}>
                        <div className="text-base leading-none">
                          {formatTransactionDelta(delta)}
                        </div>
                        <div className="mt-1 text-[10px] font-bold uppercase text-muted-foreground">
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
      </motion.div>
    </AnimatePresence>
  );
}
