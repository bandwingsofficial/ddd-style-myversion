'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Layers, Loader2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { Select } from '@/components/ui/select';
import { NumericInput, parseNumericInputValue } from '@/components/ui/numeric-input';
import DiscardChangesDialog from '@/features/categories/components/discard-changes-dialog';
import { StockItem } from '@/features/stock-items/types/stock-item.types';
import { InventoryApi } from '../api/inventory.api';
import { InventoryFormErrors } from '../types/inventory.types';
import {
  formInputClassName,
  mapServerFieldErrors,
  UNEXPECTED_ERROR_TOAST,
  validateInitializeQuantity,
  validateStockItemSelection,
} from '../utils/inventory-validation';

interface Props {
  open: boolean;
  initializedStockItemIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

interface FormSnapshot {
  stockItemId: string;
  unit: string;
  quantity: string;
}

export default function InitializeInventoryModal({
  open,
  initializedStockItemIds,
  onClose,
  onSuccess,
}: Props) {
  const stockItemRef = useRef<HTMLButtonElement>(null);

  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [stockItemId, setStockItemId] = useState('');
  const [unit, setUnit] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [errors, setErrors] = useState<InventoryFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<FormSnapshot>({
    stockItemId: '',
    unit: '',
    quantity: '',
  });

  const resetForm = useCallback(() => {
    setStockItemId('');
    setUnit('');
    setQuantityInput('');
    setErrors({});
    setSubmitting(false);
    setShowDiscardDialog(false);
    setInitialSnapshot({
      stockItemId: '',
      unit: '',
      quantity: '',
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    resetForm();
    setLoadingOptions(true);

    InventoryApi.listActiveStockItemsForInitialize(initializedStockItemIds)
      .then(setStockItems)
      .catch(() => {
        toast.error('Failed to load stock items.');
      })
      .finally(() => setLoadingOptions(false));
  }, [open, resetForm, initializedStockItemIds]);

  const stockOptions = useMemo(
    () =>
      stockItems.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [stockItems],
  );

  const isDirty =
    stockItemId !== initialSnapshot.stockItemId ||
    unit !== initialSnapshot.unit ||
    quantityInput !== initialSnapshot.quantity;

  const forceClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const requestClose = useCallback(() => {
    if (submitting) {
      return;
    }

    if (isDirty) {
      setShowDiscardDialog(true);
      return;
    }

    forceClose();
  }, [forceClose, isDirty, submitting]);

  const handleStockChange = (nextStockItemId: string) => {
    setStockItemId(nextStockItemId);
    setErrors((current) => ({
      ...current,
      stockItemId: validateStockItemSelection(nextStockItemId),
    }));

    const selectedItem = stockItems.find((item) => item.id === nextStockItemId);
    setUnit(selectedItem?.unit ?? '');
  };

  const handleSubmit = async () => {
    const parsedQuantity = parseNumericInputValue(quantityInput);
    const nextErrors: InventoryFormErrors = {
      stockItemId: validateStockItemSelection(stockItemId),
      quantity: validateInitializeQuantity(parsedQuantity),
    };

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean) || submitting) {
      stockItemRef.current?.focus();
      return;
    }

    setSubmitting(true);

    try {
      await InventoryApi.initialize({
        stockItemId,
        unit,
        quantity: parsedQuantity!,
      });

      toast.success('Inventory initialized successfully.');
      onSuccess();
      forceClose();
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            message?: string | string[];
            code?: string;
            errors?: Record<string, string>;
          };
        };
      };

      const fieldErrors = mapServerFieldErrors(axiosError.response?.data);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((current) => ({ ...current, ...fieldErrors }));
        return;
      }

      if (axiosError.response?.data?.code === 'INVENTORY_ALREADY_EXISTS') {
        setErrors((current) => ({
          ...current,
          stockItemId: 'Inventory already initialized for this stock item.',
        }));
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

  if (!open) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[1px]"
            onClick={requestClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="initialize-inventory-title"
              className="flex max-h-[90vh] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex shrink-0 items-start justify-between border-b border-border px-5 py-4 sm:px-6">
                <div>
                  <h2
                    id="initialize-inventory-title"
                    className="text-lg font-bold tracking-tight text-foreground"
                  >
                    Initialize Inventory
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Set initial stock levels for an active stock item.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestClose}
                  disabled={submitting}
                  aria-label="Close"
                  className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSubmit();
                }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="initialize-stock-item"
                        className="text-sm font-semibold text-foreground"
                      >
                        Stock Item <span className="text-destructive">*</span>
                      </label>
                      <Select
                        ref={stockItemRef}
                        id="initialize-stock-item"
                        value={stockItemId}
                        onChange={handleStockChange}
                        options={stockOptions}
                        placeholder={
                          loadingOptions
                            ? 'Loading stock items...'
                            : stockOptions.length
                              ? 'Select stock item'
                              : 'No stock items available'
                        }
                        searchable
                        disabled={submitting || loadingOptions}
                        hasError={!!errors.stockItemId}
                        leadingIcon={<Layers size={16} />}
                      />
                      {errors.stockItemId && (
                        <p className="text-sm text-destructive">
                          {errors.stockItemId}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-foreground">
                        Measurement Unit
                      </label>
                      <div className="relative">
                        <Layers
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                          value={unit || 'Select a stock item first'}
                          readOnly
                          className={`${formInputClassName} cursor-not-allowed bg-muted/50 pl-10 text-muted-foreground`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="initialize-quantity"
                        className="text-sm font-semibold text-foreground"
                      >
                        Initial Quantity <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Box
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <NumericInput
                          id="initialize-quantity"
                          value={quantityInput}
                          onChange={(nextValue) => {
                            setQuantityInput(nextValue);
                            setErrors((current) => ({
                              ...current,
                              quantity: validateInitializeQuantity(
                                parseNumericInputValue(nextValue),
                              ),
                            }));
                          }}
                          disabled={submitting}
                          className={`${formInputClassName} pl-10`}
                        />
                      </div>
                      {errors.quantity && (
                        <p className="text-sm text-destructive">
                          {errors.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={requestClose}
                    disabled={submitting}
                    className="h-11 flex-1 rounded-xl border border-input bg-background text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      loadingOptions ||
                      !stockItemId ||
                      stockOptions.length === 0
                    }
                    className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting ? 'Initializing...' : 'Initialize Inventory'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DiscardChangesDialog
        open={showDiscardDialog}
        onContinue={() => setShowDiscardDialog(false)}
        onDiscard={() => {
          setShowDiscardDialog(false);
          forceClose();
        }}
      />
    </>
  );
}
