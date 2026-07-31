'use client';

import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { OutletUser } from '../types/outlet-user.types';

interface Props {
  user: OutletUser | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function OutletUserStatusDialog({
  user,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  const isActive = user?.isActive;

  return (
    <AnimatePresence>
      {user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10050] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          onClick={loading ? undefined : onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[420px] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {isActive ? 'Inactivate User?' : 'Activate User?'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isActive
                    ? 'This user will no longer be able to sign in.'
                    : 'This user will regain access to the assigned outlet.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-6 text-center">
              <div className="mb-4 flex justify-center">
                {isActive ? (
                  <div className="rounded-full bg-destructive/10 p-4 text-destructive">
                    <AlertCircle size={40} />
                  </div>
                ) : (
                  <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-600">
                    <CheckCircle2 size={40} />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                You are changing{' '}
                <span className="font-semibold text-foreground">{user.name}</span>
                .
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onConfirm();
                }}
                className={`inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50 ${
                  isActive
                    ? 'bg-destructive hover:bg-destructive/90'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
