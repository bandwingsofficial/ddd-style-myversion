'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, Minus, Plus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import {
  NumericInput,
  parseNumericInputValue,
} from '@/components/ui/numeric-input';
import {
  InventoryAdjustmentType,
  InventoryListItem,
} from '../types/inventory.types';
import { InventoryApi } from '../api/inventory.api';
import {
  formInputClassName,
  formTextareaClassName,
  formatTransactionDelta,
  getAdjustmentDelta,
  getQuantityValue,
  mapServerFieldErrors,
  UNEXPECTED_ERROR_TOAST,
  validateAdjustmentQuantity,
  validateRemarks,
} from '../utils/inventory-validation';

interface Props {
  item: InventoryListItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdjustStockModal({ item, onClose, onSuccess }: Props) {
  const currentStock = getQuantityValue(item.availableQty);
  const totalStock = getQuantityValue(item.totalQty);

  const [adjustmentType, setAdjustmentType] =
    useState<InventoryAdjustmentType>('DEDUCT');
  const [adjustmentInput, setAdjustmentInput] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState<{
    adjustmentQuantity?: string;
    remarks?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const parsedAdjustment = parseNumericInputValue(adjustmentInput);
  const delta = getAdjustmentDelta(adjustmentType, parsedAdjustment);
  const newStock =
    delta === null ? null : Math.max(0, currentStock + delta);

  const submit = async () => {
    const nextErrors = {
      adjustmentQuantity: validateAdjustmentQuantity(
        parsedAdjustment,
        adjustmentType,
        currentStock,
        totalStock,
      ),
      remarks: validateRemarks(remarks),
    };

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean) || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      await InventoryApi.adjustStock({
        stockItemId: item.stockItemId,
        adjustmentType,
        adjustmentQuantity: parsedAdjustment!,
        remarks: remarks.trim(),
      });

      toast.success('Stock adjusted successfully.');
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Adjust Stock</h2>
                <p className="text-sm text-muted-foreground">
                  Add or deduct available stock for {item.stockName}.
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
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Stock</span>
                  <span className="font-semibold text-foreground">
                    {currentStock} {item.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setAdjustmentType('ADD');
                      setErrors((current) => ({
                        ...current,
                        adjustmentQuantity: undefined,
                      }));
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                      adjustmentType === 'ADD'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : 'border-input bg-background text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Plus size={16} />
                    Add Stock
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setAdjustmentType('DEDUCT');
                      setErrors((current) => ({
                        ...current,
                        adjustmentQuantity: undefined,
                      }));
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                      adjustmentType === 'DEDUCT'
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-input bg-background text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Minus size={16} />
                    Deduct Stock
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Adjustment Quantity ({item.unit})
                </label>
                <NumericInput
                  autoFocus
                  value={adjustmentInput}
                  onChange={(nextValue) => {
                    setAdjustmentInput(nextValue);
                    setErrors((current) => ({
                      ...current,
                      adjustmentQuantity: validateAdjustmentQuantity(
                        parseNumericInputValue(nextValue),
                        adjustmentType,
                        currentStock,
                        totalStock,
                      ),
                    }));
                  }}
                  disabled={submitting}
                  className={formInputClassName}
                />
                {errors.adjustmentQuantity && (
                  <p className="text-sm text-destructive">
                    {errors.adjustmentQuantity}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Preview
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Stock</span>
                  <span className="font-medium text-foreground">
                    {currentStock} {item.unit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Adjustment</span>
                  <span
                    className={`font-bold ${
                      delta === null
                        ? 'text-muted-foreground'
                        : delta >= 0
                          ? 'text-emerald-600'
                          : 'text-blue-600'
                    }`}
                  >
                    {delta === null
                      ? '—'
                      : `${formatTransactionDelta(delta)} ${item.unit}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-sm">
                  <span className="font-semibold text-muted-foreground">
                    New Stock
                  </span>
                  <span className="font-bold text-foreground">
                    {newStock === null ? '—' : `${newStock} ${item.unit}`}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Remarks <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(event) => {
                    setRemarks(event.target.value);
                    setErrors((current) => ({ ...current, remarks: undefined }));
                  }}
                  disabled={submitting}
                  placeholder="e.g. Spillage, expiry, or internal usage"
                  className={formTextareaClassName}
                />
                {errors.remarks && (
                  <p className="text-sm text-destructive">{errors.remarks}</p>
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
              disabled={submitting}
              className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Saving...' : 'Confirm Adjustment'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
