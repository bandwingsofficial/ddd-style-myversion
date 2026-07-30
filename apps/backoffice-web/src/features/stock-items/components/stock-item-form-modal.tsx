'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import DiscardChangesDialog from '@/features/categories/components/discard-changes-dialog';
import { StockItemsApi } from '../api/stock-items.api';
import {
  StockItem,
  StockItemFormErrors,
  STOCK_UNITS,
  StockUnit,
} from '../types/stock-item.types';
import {
  formInputClassName,
  formSelectClassName,
  mapServerFieldErrors,
  normalizeStockItemName,
  UNEXPECTED_ERROR_TOAST,
  validateStockItemName,
  validateStockItemNameDuplicate,
  validateStockItemUnit,
} from '../utils/stock-item-validation';

type StockItemFormMode = 'create' | 'edit';

interface StockItemFormModalProps {
  mode: StockItemFormMode;
  open: boolean;
  stockItem?: StockItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FieldKey = 'name' | 'unit';

const FIELD_ORDER: FieldKey[] = ['name', 'unit'];

interface FormSnapshot {
  name: string;
  unit: StockUnit;
}

export default function StockItemFormModal({
  mode,
  open,
  stockItem = null,
  onClose,
  onSuccess,
}: StockItemFormModalProps) {
  const isCreate = mode === 'create';

  const nameRef = useRef<HTMLInputElement>(null);
  const unitRef = useRef<HTMLSelectElement>(null);

  const [name, setName] = useState('');
  const [unit, setUnit] = useState<StockUnit>('PIECE');
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<StockItemFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<FormSnapshot>({
    name: '',
    unit: 'PIECE',
  });

  const resetForm = useCallback(() => {
    if (isCreate) {
      setName('');
      setUnit('PIECE');
      setInitialSnapshot({ name: '', unit: 'PIECE' });
    } else if (stockItem) {
      setName(stockItem.name);
      setUnit(stockItem.unit);
      setInitialSnapshot({
        name: stockItem.name,
        unit: stockItem.unit,
      });
    }

    setErrors({});
    setSubmitting(false);
    setShowDiscardDialog(false);
  }, [isCreate, stockItem]);

  useEffect(() => {
    if (!open) {
      return;
    }

    resetForm();

    StockItemsApi.getAll()
      .then((items) => setExistingNames(items.map((item) => item.name)))
      .catch(() => {
        // Duplicate check falls back to server-side validation.
      });
  }, [open, resetForm]);

  const buildFieldErrors = useCallback(
    (
      nextName: string,
      nextUnit: string,
      options?: { checkDuplicate?: boolean },
    ): StockItemFormErrors => {
      const nextErrors: StockItemFormErrors = {
        name: validateStockItemName(nextName),
        unit: validateStockItemUnit(nextUnit),
      };

      if (options?.checkDuplicate) {
        const duplicateError = validateStockItemNameDuplicate(
          nextName,
          existingNames,
          isCreate ? undefined : stockItem?.name,
        );

        if (duplicateError) {
          nextErrors.name = duplicateError;
        }
      }

      return nextErrors;
    },
    [existingNames, isCreate, stockItem?.name],
  );

  const currentErrors = useMemo(
    () => buildFieldErrors(name, unit, { checkDuplicate: true }),
    [buildFieldErrors, name, unit],
  );

  const isFormValid = useMemo(
    () => !currentErrors.name && !currentErrors.unit,
    [currentErrors],
  );

  const isDirty = useMemo(() => {
    return name !== initialSnapshot.name || unit !== initialSnapshot.unit;
  }, [initialSnapshot.name, initialSnapshot.unit, name, unit]);

  const updateName = (value: string) => {
    setName(value);
    setErrors((current) => ({
      ...current,
      name:
        validateStockItemNameDuplicate(
          value,
          existingNames,
          isCreate ? undefined : stockItem?.name,
        ) ?? validateStockItemName(value),
    }));
  };

  const updateUnit = (value: StockUnit) => {
    setUnit(value);
    setErrors((current) => ({
      ...current,
      unit: validateStockItemUnit(value),
    }));
  };

  const focusField = (field: FieldKey) => {
    const refMap = {
      name: nameRef,
      unit: unitRef,
    };

    const target = refMap[field].current;

    if (!target) {
      return;
    }

    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const focusFirstInvalidField = (nextErrors: StockItemFormErrors) => {
    for (const field of FIELD_ORDER) {
      if (nextErrors[field]) {
        focusField(field);
        break;
      }
    }
  };

  const forceClose = useCallback(() => {
    setShowDiscardDialog(false);
    onClose();
  }, [onClose]);

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

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();

        if (showDiscardDialog) {
          setShowDiscardDialog(false);
          return;
        }

        requestClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, requestClose, showDiscardDialog]);

  const handleSubmit = async () => {
    const nextErrors = buildFieldErrors(name, unit, {
      checkDuplicate: true,
    });

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean) || submitting) {
      focusFirstInvalidField(nextErrors);
      return;
    }

    if (!isCreate && !stockItem) {
      return;
    }

    setSubmitting(true);

    try {
      if (isCreate) {
        await StockItemsApi.create({
          name: normalizeStockItemName(name),
          unit,
        });
        toast.success('Stock item created successfully.');
      } else {
        await StockItemsApi.update(stockItem!.id, {
          name: normalizeStockItemName(name),
          unit,
        });
        toast.success('Stock item updated successfully.');
      }

      onSuccess();
      forceClose();
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            message?: string | string[];
            errors?: Record<string, string>;
          };
        };
      };

      const fieldErrors = mapServerFieldErrors(axiosError.response?.data);

      if (Object.keys(fieldErrors).length > 0) {
        setErrors((current) => ({ ...current, ...fieldErrors }));
        focusFirstInvalidField(fieldErrors);
        return;
      }

      if (axiosError.response?.status === 400) {
        return;
      }

      toast.error(UNEXPECTED_ERROR_TOAST);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || (!isCreate && !stockItem)) {
    return null;
  }

  const title = isCreate ? 'Create Stock Item' : 'Edit Stock Item';
  const subtitleText = isCreate
    ? 'Add a new stock item to your inventory catalog.'
    : 'Update stock item details.';
  const submitLabel = isCreate ? 'Create Stock Item' : 'Save Changes';

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
              aria-labelledby="stock-item-form-title"
              className="flex max-h-[90vh] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex shrink-0 items-start justify-between border-b border-border px-5 py-4 sm:px-6">
                <div>
                  <h2
                    id="stock-item-form-title"
                    className="text-lg font-bold tracking-tight text-foreground"
                  >
                    {title}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {subtitleText}
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
                  if (isFormValid && !submitting) {
                    void handleSubmit();
                  }
                }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="stock-item-name"
                        className="text-sm font-semibold text-foreground"
                      >
                        Stock Item Name{' '}
                        <span className="text-destructive">*</span>
                      </label>
                      <input
                        ref={nameRef}
                        id="stock-item-name"
                        value={name}
                        onChange={(event) => updateName(event.target.value)}
                        onBlur={() => {
                          setErrors((current) => ({
                            ...current,
                            name:
                              validateStockItemNameDuplicate(
                                name,
                                existingNames,
                                isCreate ? undefined : stockItem?.name,
                              ) ?? validateStockItemName(name),
                          }));
                        }}
                        disabled={submitting}
                        autoFocus
                        placeholder="Enter stock item name"
                        className={formInputClassName(!!errors.name)}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="stock-item-unit"
                        className="text-sm font-semibold text-foreground"
                      >
                        Unit <span className="text-destructive">*</span>
                      </label>
                      <select
                        ref={unitRef}
                        id="stock-item-unit"
                        value={unit}
                        onChange={(event) =>
                          updateUnit(event.target.value as StockUnit)
                        }
                        onBlur={() => {
                          setErrors((current) => ({
                            ...current,
                            unit: validateStockItemUnit(unit),
                          }));
                        }}
                        disabled={submitting}
                        className={formSelectClassName(!!errors.unit)}
                      >
                        {STOCK_UNITS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.unit && (
                        <p className="text-sm text-destructive" role="alert">
                          {errors.unit}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 justify-end gap-3 border-t border-border px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={requestClose}
                    disabled={submitting}
                    className="inline-flex h-11 items-center rounded-xl border border-input px-4 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !isFormValid}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    {submitLabel}
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
        onDiscard={forceClose}
      />
    </>
  );
}
