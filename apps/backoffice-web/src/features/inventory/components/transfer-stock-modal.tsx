'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Package, Store, Truck, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { Select } from '@/components/ui/select';
import {
  NumericInput,
  parseNumericInputValue,
} from '@/components/ui/numeric-input';
import { InventoryListItem } from '../types/inventory.types';
import { InventoryApi } from '../api/inventory.api';
import {
  formInputClassName,
  getQuantityValue,
  mapServerFieldErrors,
  UNEXPECTED_ERROR_TOAST,
  validateOutletSelection,
  validatePositiveQuantity,
} from '../utils/inventory-validation';

interface Props {
  item: InventoryListItem;
  onClose: () => void;
  onSuccess: () => void;
}

interface OutletOption {
  id: string;
  name: string;
  branch?: string;
  status?: string;
}

export default function TransferStockModal({ item, onClose, onSuccess }: Props) {
  const available = getQuantityValue(item.availableQty);

  const [outlets, setOutlets] = useState<OutletOption[]>([]);
  const [outletId, setOutletId] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [errors, setErrors] = useState<{
    outletId?: string;
    quantity?: string;
  }>({});
  const [loadingOutlets, setLoadingOutlets] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const parsedQuantity = parseNumericInputValue(quantityInput);

  useEffect(() => {
    InventoryApi.listActiveOutlets()
      .then(setOutlets)
      .catch(() => {
        toast.error('Failed to load outlets.');
      })
      .finally(() => setLoadingOutlets(false));
  }, []);

  const outletOptions = useMemo(
    () =>
      outlets.map((outlet) => ({
        value: outlet.id,
        label: outlet.branch
          ? `${outlet.name} (${outlet.branch})`
          : outlet.name,
      })),
    [outlets],
  );

  const submit = async () => {
    const nextErrors = {
      outletId: validateOutletSelection(outletId),
      quantity: validatePositiveQuantity(parsedQuantity),
    };

    if (parsedQuantity !== null && parsedQuantity > available) {
      nextErrors.quantity = `Insufficient stock. Max transfer is ${available} ${item.unit}.`;
    }

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean) || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      await InventoryApi.transferStock({
        stockItemId: item.stockItemId,
        outletId,
        quantity: parsedQuantity!,
      });

      toast.success('Stock transferred successfully.');
      onSuccess();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          data?: { message?: string | string[]; errors?: Record<string, string> };
        };
      };

      const fieldErrors = mapServerFieldErrors(axiosError.response?.data);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((current) => ({ ...current, ...fieldErrors }));
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Truck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Transfer Stock</h2>
                <p className="text-sm text-muted-foreground">
                  Move inventory from central stock to an outlet.
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
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
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
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Available
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {available} {item.unit}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Destination Outlet <span className="text-destructive">*</span>
                </label>
                <Select
                  value={outletId}
                  onChange={(value) => {
                    setOutletId(value);
                    setErrors((current) => ({ ...current, outletId: undefined }));
                  }}
                  options={outletOptions}
                  placeholder={
                    loadingOutlets ? 'Loading outlets...' : 'Select outlet'
                  }
                  searchable
                  disabled={submitting || loadingOutlets}
                  hasError={!!errors.outletId}
                  leadingIcon={<Store size={16} />}
                />
                {errors.outletId && (
                  <p className="text-sm text-destructive">{errors.outletId}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Quantity to Transfer ({item.unit})
                </label>
                <NumericInput
                  value={quantityInput}
                  onChange={(nextValue) => {
                    setQuantityInput(nextValue);
                    setErrors((current) => ({ ...current, quantity: undefined }));
                  }}
                  disabled={submitting}
                  className={formInputClassName}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">{errors.quantity}</p>
                )}
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
              disabled={submitting || loadingOutlets}
              className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-xl bg-amber-500 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Processing...' : 'Process Transfer'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
