import {
  InventoryFormErrors,
  InventoryQuantity,
  InventoryTransaction,
} from '../types/inventory.types';

export const UNEXPECTED_ERROR_TOAST =
  'Something went wrong. Please try again.';

export function getQuantityValue(
  quantity: InventoryQuantity | number | undefined,
): number {
  if (typeof quantity === 'number') {
    return quantity;
  }

  return quantity?.value ?? 0;
}

export function getTransactionDelta(
  transaction: InventoryTransaction,
): number {
  const signedChange = transaction.quantityChange?.value;

  if (signedChange !== undefined && signedChange !== 0) {
    return signedChange;
  }

  const previous = getQuantityValue(transaction.previousQuantity);
  const next = getQuantityValue(transaction.newQuantity);

  if (next !== previous) {
    return next - previous;
  }

  const magnitude = getQuantityValue(transaction.quantity);

  if (transaction.type.includes('TRANSFER')) {
    if (transaction.remarks?.toLowerCase().includes('received at outlet')) {
      return magnitude;
    }

    return -magnitude;
  }

  if (
    transaction.type.includes('ADD') ||
    transaction.type.includes('INITIALIZE')
  ) {
    return magnitude;
  }

  if (transaction.type.includes('ADJUST') || transaction.type.includes('DEDUCT')) {
    return -magnitude;
  }

  return magnitude;
}

export function formatTransactionDelta(delta: number): string {
  if (delta > 0) {
    return `+${delta}`;
  }

  if (delta < 0) {
    return `${delta}`;
  }

  return '0';
}

export function mapServerFieldErrors(
  data?: { message?: string | string[]; errors?: Record<string, string> },
): InventoryFormErrors {
  if (!data?.errors) {
    return {};
  }

  return {
    stockItemId: data.errors.stockItemId,
    quantity: data.errors.quantity,
    adjustmentQuantity: data.errors.adjustmentQuantity,
    adjustmentType: data.errors.adjustmentType,
    outletId: data.errors.outletId,
    newAvailableQty: data.errors.newAvailableQty,
    remarks: data.errors.remarks,
  };
}

export function validateInitializeQuantity(
  value: number | null,
): string | undefined {
  if (value === null) {
    return 'Quantity is required.';
  }

  if (!Number.isFinite(value) || value < 0) {
    return 'Quantity must be zero or greater.';
  }

  return undefined;
}

export function validatePositiveQuantity(
  value: number | null,
): string | undefined {
  if (value === null) {
    return 'Quantity is required.';
  }

  if (!Number.isFinite(value) || value <= 0) {
    return 'Quantity must be greater than zero.';
  }

  return undefined;
}

export function validateAdjustmentQuantity(
  value: number | null,
  adjustmentType: 'ADD' | 'DEDUCT',
  currentStock: number,
  maxTotal: number,
): string | undefined {
  const requiredError = validatePositiveQuantity(value);

  if (requiredError) {
    return requiredError;
  }

  if (adjustmentType === 'DEDUCT' && value! > currentStock) {
    return `Adjustment cannot exceed current stock (${currentStock}).`;
  }

  if (adjustmentType === 'ADD' && currentStock + value! > maxTotal) {
    return `Adjustment would exceed total stock (${maxTotal}).`;
  }

  return undefined;
}

export function getAdjustmentDelta(
  adjustmentType: 'ADD' | 'DEDUCT',
  quantity: number | null,
): number | null {
  if (quantity === null) {
    return null;
  }

  return adjustmentType === 'ADD' ? quantity : -quantity;
}

export function validateAvailableQuantity(
  value: number | null,
  maxTotal: number,
): string | undefined {
  if (value === null) {
    return 'Available quantity is required.';
  }

  if (!Number.isFinite(value) || value < 0) {
    return 'Available quantity must be zero or greater.';
  }

  if (value > maxTotal) {
    return `Available quantity cannot exceed total stock (${maxTotal}).`;
  }

  return undefined;
}

export function validateStockItemSelection(value: string): string | undefined {
  if (!value.trim()) {
    return 'Stock item is required.';
  }

  return undefined;
}

export function validateOutletSelection(value: string): string | undefined {
  if (!value.trim()) {
    return 'Outlet is required.';
  }

  return undefined;
}

export function validateRemarks(value: string): string | undefined {
  if (!value.trim()) {
    return 'Remarks are required.';
  }

  return undefined;
}

export const formInputClassName =
  'h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10';

export const formTextareaClassName =
  'min-h-[96px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none';
