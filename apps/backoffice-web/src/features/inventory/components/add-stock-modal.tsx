'use client';

import { useState } from 'react';
import { Loader2, Package, PlusCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import {
  NumericInput,
  parseNumericInputValue,
} from '@/components/ui/numeric-input';
import { InventoryListItem } from '../types/inventory.types';
import { InventoryApi } from '../api/inventory.api';
import {
  formInputClassName,
  mapServerFieldErrors,
  UNEXPECTED_ERROR_TOAST,
  validatePositiveQuantity,
} from '../utils/inventory-validation';

interface Props {
  item: InventoryListItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStockModal({ item, onClose, onSuccess }: Props) {
  const [quantityInput, setQuantityInput] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const parsedQuantity = parseNumericInputValue(quantityInput);

  const submit = async () => {
    const quantityError = validatePositiveQuantity(parsedQuantity);
    setError(quantityError);

    if (quantityError || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      await InventoryApi.addStock({
        stockItemId: item.stockItemId,
        quantity: parsedQuantity!,
      });

      toast.success('Stock added successfully.');
      onSuccess();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          data?: { message?: string | string[]; errors?: Record<string, string> };
        };
      };

      const fieldErrors = mapServerFieldErrors(axiosError.response?.data);
      if (fieldErrors.quantity) {
        setError(fieldErrors.quantity);
        return;
      }

      toast.error(
        (Array.isArray(axiosError.response?.data?.message)
          ? axiosError.response?.data?.message[0]
          : axiosError.response?.data?.message) || UNEXPECTED_ERROR_TOAST,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[1px]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          role="dialog"
          aria-modal="true"
          className="flex max-h-[90vh] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between border-b border-border px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PlusCircle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Add Stock</h2>
                <p className="text-sm text-muted-foreground">
                  Increase central inventory for {item.stockName}.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
                <Package size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Stock Item
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {item.stockName}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Quantity to Add ({item.unit})
                </label>
                <NumericInput
                  autoFocus
                  value={quantityInput}
                  onChange={(nextValue) => {
                    setQuantityInput(nextValue);
                    setError(undefined);
                  }}
                  disabled={submitting}
                  className={formInputClassName}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-11 flex-1 rounded-xl border border-input bg-background text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting || !parsedQuantity || parsedQuantity <= 0}
              className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Adding...' : 'Confirm Addition'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
