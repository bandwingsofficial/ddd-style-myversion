import { StockItemFormErrors } from '../types/stock-item.types';

export const STOCK_ITEM_NAME_REQUIRED_ERROR = 'Stock item name is required.';
export const STOCK_ITEM_NAME_WHITESPACE_ERROR =
  'Stock item name cannot have leading or trailing spaces.';
export const STOCK_ITEM_NAME_MAX_LENGTH_ERROR =
  'Stock item name cannot exceed 100 characters.';
export const STOCK_ITEM_NAME_DUPLICATE_ERROR = 'Stock item already exists.';
export const STOCK_ITEM_UNIT_REQUIRED_ERROR = 'Unit is required.';

export const UNEXPECTED_ERROR_TOAST =
  'Something went wrong. Please try again.';

export function normalizeStockItemName(value: string): string {
  return value.trim();
}

export function validateStockItemName(value: string): string | undefined {
  const trimmed = normalizeStockItemName(value);

  if (!trimmed) {
    return STOCK_ITEM_NAME_REQUIRED_ERROR;
  }

  if (value !== trimmed) {
    return STOCK_ITEM_NAME_WHITESPACE_ERROR;
  }

  if (trimmed.length < 2) {
    return 'Stock item name must be at least 2 characters.';
  }

  if (trimmed.length > 100) {
    return STOCK_ITEM_NAME_MAX_LENGTH_ERROR;
  }

  return undefined;
}

export function validateStockItemNameDuplicate(
  value: string,
  existingNames: string[],
  excludeName?: string,
): string | undefined {
  const trimmed = normalizeStockItemName(value);

  if (!trimmed || validateStockItemName(value)) {
    return undefined;
  }

  const normalized = trimmed.toLowerCase();
  const excluded = excludeName
    ? normalizeStockItemName(excludeName).toLowerCase()
    : '';

  const hasDuplicate = existingNames.some((existing) => {
    const existingNormalized = normalizeStockItemName(existing).toLowerCase();
    return existingNormalized === normalized && existingNormalized !== excluded;
  });

  return hasDuplicate ? STOCK_ITEM_NAME_DUPLICATE_ERROR : undefined;
}

export function validateStockItemUnit(value: string): string | undefined {
  if (!value) {
    return STOCK_ITEM_UNIT_REQUIRED_ERROR;
  }

  return undefined;
}

export function mapServerFieldError(message: string): StockItemFormErrors {
  const normalized = message.toLowerCase();

  if (normalized.includes('already exists')) {
    return { name: STOCK_ITEM_NAME_DUPLICATE_ERROR };
  }

  if (
    normalized.includes('leading or trailing spaces') ||
    normalized.includes('cannot have leading')
  ) {
    return { name: STOCK_ITEM_NAME_WHITESPACE_ERROR };
  }

  if (normalized.includes('exceed') && normalized.includes('100')) {
    return { name: STOCK_ITEM_NAME_MAX_LENGTH_ERROR };
  }

  if (normalized.includes('at least 2')) {
    return { name: 'Stock item name must be at least 2 characters.' };
  }

  if (normalized.includes('inactive') && normalized.includes('activate')) {
    return { name: 'Cannot edit inactive stock item. Activate it first.' };
  }

  if (normalized.includes('required') && normalized.includes('name')) {
    return { name: STOCK_ITEM_NAME_REQUIRED_ERROR };
  }

  if (normalized.includes('unit')) {
    return { unit: message };
  }

  if (normalized.includes('name')) {
    return { name: message };
  }

  return {};
}

export function mapServerFieldErrors(
  payload:
    | {
        message?: string | string[];
        errors?: Record<string, string>;
      }
    | undefined,
): StockItemFormErrors {
  if (!payload) {
    return {};
  }

  if (payload.errors && typeof payload.errors === 'object') {
    return { ...payload.errors };
  }

  const message = payload.message;

  if (!message) {
    return {};
  }

  const messages = Array.isArray(message) ? message : [message];
  return messages.reduce<StockItemFormErrors>((accumulator, item) => {
    const mapped = mapServerFieldError(item);
    return { ...accumulator, ...mapped };
  }, {});
}

export function formInputClassName(hasError: boolean): string {
  return [
    'h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition-colors',
    hasError
      ? 'border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10'
      : 'border-input focus:border-primary focus:ring-4 focus:ring-primary/10',
  ].join(' ');
}

export function formSelectClassName(hasError: boolean): string {
  return formInputClassName(hasError);
}
