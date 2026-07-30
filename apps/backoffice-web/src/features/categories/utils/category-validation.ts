import { CategoryFormErrors } from '../types/category.types';

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.svg',
];

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export const CATEGORY_NAME_REQUIRED_ERROR = 'Category name is required.';
export const CATEGORY_NAME_WHITESPACE_ERROR =
  'Category name cannot have leading or trailing spaces.';
export const CATEGORY_NAME_MAX_LENGTH_ERROR =
  'Category name cannot exceed 100 characters.';
export const CATEGORY_NAME_DUPLICATE_ERROR = 'Category already exists.';

export const UNEXPECTED_ERROR_TOAST =
  'Something went wrong. Please try again.';

export function normalizeCategoryName(value: string): string {
  return value.trim();
}

export function validateCategoryName(value: string): string | undefined {
  const trimmed = normalizeCategoryName(value);

  if (!trimmed) {
    return CATEGORY_NAME_REQUIRED_ERROR;
  }

  if (value !== trimmed) {
    return CATEGORY_NAME_WHITESPACE_ERROR;
  }

  if (trimmed.length < 2) {
    return 'Category name must be at least 2 characters.';
  }

  if (trimmed.length > 100) {
    return CATEGORY_NAME_MAX_LENGTH_ERROR;
  }

  return undefined;
}

export function validateCategoryNameDuplicate(
  value: string,
  existingNames: string[],
  excludeName?: string,
): string | undefined {
  const trimmed = normalizeCategoryName(value);

  if (!trimmed || validateCategoryName(value)) {
    return undefined;
  }

  const normalized = trimmed.toLowerCase();
  const excluded = excludeName ? normalizeCategoryName(excludeName).toLowerCase() : '';

  const hasDuplicate = existingNames.some((existing) => {
    const existingNormalized = normalizeCategoryName(existing).toLowerCase();
    return existingNormalized === normalized && existingNormalized !== excluded;
  });

  return hasDuplicate ? CATEGORY_NAME_DUPLICATE_ERROR : undefined;
}

export function validateCategorySubtitle(value: string): string | undefined {
  if (value.length > 150) {
    return 'Subtitle cannot exceed 150 characters.';
  }

  return undefined;
}

export function validateCategoryImage(
  file: File | null,
  required: boolean,
): string | undefined {
  if (!file) {
    return required ? 'Cover image is required.' : undefined;
  }

  const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  const isAllowedType =
    ALLOWED_IMAGE_TYPES.includes(file.type) ||
    ALLOWED_IMAGE_EXTENSIONS.includes(extension);

  if (!isAllowedType) {
    return 'Only JPG, JPEG, PNG, WEBP, and SVG images are allowed.';
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'Image must be 10MB or smaller.';
  }

  return undefined;
}

export function mapServerFieldError(message: string): CategoryFormErrors {
  const normalized = message.toLowerCase();

  if (normalized.includes('already exists')) {
    return { name: CATEGORY_NAME_DUPLICATE_ERROR };
  }

  if (
    normalized.includes('leading or trailing spaces') ||
    normalized.includes('cannot have leading')
  ) {
    return { name: CATEGORY_NAME_WHITESPACE_ERROR };
  }

  if (normalized.includes('exceed') && normalized.includes('100')) {
    return { name: CATEGORY_NAME_MAX_LENGTH_ERROR };
  }

  if (normalized.includes('at least 2')) {
    return { name: 'Category name must be at least 2 characters.' };
  }

  if (normalized.includes('required') && normalized.includes('name')) {
    return { name: CATEGORY_NAME_REQUIRED_ERROR };
  }

  if (normalized.includes('required') && normalized.includes('image')) {
    return { image: 'Cover image is required.' };
  }

  if (normalized.includes('subtitle')) {
    return { subtitle: message };
  }

  if (normalized.includes('image')) {
    return { image: message };
  }

  if (normalized.includes('name')) {
    return { name: message };
  }

  return {};
}

export function mapServerFieldErrors(
  message: string | string[] | undefined,
): CategoryFormErrors {
  if (!message) {
    return {};
  }

  const messages = Array.isArray(message) ? message : [message];
  return messages.reduce<CategoryFormErrors>((accumulator, item) => {
    const mapped = mapServerFieldError(item);
    return { ...accumulator, ...mapped };
  }, {});
}

export function isUnexpectedServerError(error: unknown): boolean {
  const axiosError = error as {
    response?: { status?: number };
    code?: string;
  };

  if (!axiosError?.response) {
    return true;
  }

  const status = axiosError.response.status ?? 500;
  return status >= 500;
}

export function formInputClassName(hasError: boolean): string {
  return [
    'h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition-colors',
    hasError
      ? 'border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10'
      : 'border-input focus:border-primary focus:ring-4 focus:ring-primary/10',
  ].join(' ');
}

export function categoryNameInputClassName(hasError: boolean): string {
  return formInputClassName(hasError);
}
