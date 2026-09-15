import { ProductFormErrors } from '../types/product.types';

export const PRODUCT_NAME_REQUIRED_ERROR = 'Product name is required.';
export const PRODUCT_NAME_WHITESPACE_ERROR =
  'Product name cannot have leading or trailing spaces.';
export const PRODUCT_NAME_MIN_LENGTH_ERROR =
  'Product name must be at least 2 characters.';
export const PRODUCT_NAME_MAX_LENGTH_ERROR =
  'Product name cannot exceed 150 characters.';
export const PRODUCT_NAME_DUPLICATE_ERROR =
  'Product with this name already exists.';
export const CATEGORY_REQUIRED_ERROR = 'Category is required.';
export const ORIGINAL_PRICE_REQUIRED_ERROR = 'Original price is required.';
export const ORIGINAL_PRICE_MIN_ERROR =
  'Original price must be greater than 0.';
export const DISCOUNT_PRICE_NEGATIVE_ERROR =
  'Discount price cannot be negative.';
export const DISCOUNT_PRICE_EXCEEDS_ERROR =
  'Discount price cannot exceed original price.';
export const MAIN_IMAGE_REQUIRED_ERROR = 'Main product image is required.';
export const UNIT_VALUE_MIN_ERROR = 'Unit value must be at least 1.';
export const MAX_GALLERY_VIDEOS = 5;
export const MAX_VIDEO_DURATION_SECONDS = 60;
export const GALLERY_MEDIA_ACCEPT = 'image/*,video/mp4,video/webm';
export const GALLERY_VIDEO_TOO_MANY_ERROR =
  'Maximum 5 videos are allowed per product.';
export const GALLERY_VIDEO_DURATION_ERROR =
  'Video duration must be 1 minute or less.';
export const GALLERY_VIDEO_INVALID_TYPE_ERROR =
  'Only MP4 and WebM videos are supported.';

export const UNEXPECTED_ERROR_TOAST =
  'Something went wrong. Please try again.';

export function normalizeProductName(value: string): string {
  return value.trim();
}

export function validateProductName(value: string): string | undefined {
  const trimmed = normalizeProductName(value);

  if (!trimmed) {
    return PRODUCT_NAME_REQUIRED_ERROR;
  }

  if (value !== trimmed) {
    return PRODUCT_NAME_WHITESPACE_ERROR;
  }

  if (trimmed.length < 2) {
    return PRODUCT_NAME_MIN_LENGTH_ERROR;
  }

  if (trimmed.length > 150) {
    return PRODUCT_NAME_MAX_LENGTH_ERROR;
  }

  return undefined;
}

export function validateCategoryId(value: string): string | undefined {
  if (!value) {
    return CATEGORY_REQUIRED_ERROR;
  }

  return undefined;
}

export function validateOriginalPrice(value: number): string | undefined {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return ORIGINAL_PRICE_REQUIRED_ERROR;
  }

  if (value <= 0) {
    return ORIGINAL_PRICE_MIN_ERROR;
  }

  return undefined;
}

export function validateDiscountPrice(
  discount: number,
  original: number,
): string | undefined {
  if (discount === undefined || discount === null || Number.isNaN(discount)) {
    return undefined;
  }

  if (discount < 0) {
    return DISCOUNT_PRICE_NEGATIVE_ERROR;
  }

  if (discount > 0 && discount > original) {
    return DISCOUNT_PRICE_EXCEEDS_ERROR;
  }

  return undefined;
}

export function validateUnitValue(value: number): string | undefined {
  if (!value || value < 1) {
    return UNIT_VALUE_MIN_ERROR;
  }

  return undefined;
}

export function mapServerFieldError(message: string): ProductFormErrors {
  const normalized = message.toLowerCase();

  if (normalized.includes('product with this name already exists')) {
    return { productName: PRODUCT_NAME_DUPLICATE_ERROR };
  }

  if (normalized.includes('already exists')) {
    return { productName: PRODUCT_NAME_DUPLICATE_ERROR };
  }

  if (
    normalized.includes('leading or trailing spaces') ||
    normalized.includes('cannot have leading')
  ) {
    return { productName: PRODUCT_NAME_WHITESPACE_ERROR };
  }

  if (normalized.includes('at least 2')) {
    return { productName: PRODUCT_NAME_MIN_LENGTH_ERROR };
  }

  if (normalized.includes('exceed') && normalized.includes('150')) {
    return { productName: PRODUCT_NAME_MAX_LENGTH_ERROR };
  }

  if (normalized.includes('inactive') && normalized.includes('activate')) {
    return { productName: 'Cannot edit inactive product. Activate it first.' };
  }

  if (normalized.includes('product name') || normalized.includes('productname')) {
    return { productName: message };
  }

  if (normalized.includes('category')) {
    return { categoryId: message };
  }

  if (normalized.includes('discount')) {
    return { discountPrice: message };
  }

  if (normalized.includes('original price') || normalized.includes('price')) {
    return { originalPrice: message };
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
): ProductFormErrors {
  if (!payload) {
    return {};
  }

  if (payload.errors && typeof payload.errors === 'object') {
    const mapped: ProductFormErrors = {};

    for (const [key, value] of Object.entries(payload.errors)) {
      if (key === 'productName' || key === 'name') {
        mapped.productName = value;
      } else if (key === 'categoryId') {
        mapped.categoryId = value;
      } else if (key === 'originalPrice') {
        mapped.originalPrice = value;
      } else if (key === 'discountPrice') {
        mapped.discountPrice = value;
      } else {
        (mapped as Record<string, string>)[key] = value;
      }
    }

    return mapped;
  }

  const message = payload.message;

  if (!message) {
    return {};
  }

  const messages = Array.isArray(message) ? message : [message];
  return messages.reduce<ProductFormErrors>((accumulator, item) => {
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

export function isGalleryVideoFile(file: File): boolean {
  const mimeType = file.type.toLowerCase();
  if (mimeType === 'video/mp4' || mimeType === 'video/webm') {
    return true;
  }

  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  return extension === '.mp4' || extension === '.webm';
}

export function formatVideoDuration(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export async function getVideoDurationSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to read video metadata'));
    };

    video.src = objectUrl;
  });
}

export async function validateGalleryMediaFile(
  file: File,
): Promise<string | undefined> {
  if (isGalleryVideoFile(file)) {
    if (
      file.type &&
      file.type !== 'video/mp4' &&
      file.type !== 'video/webm'
    ) {
      return GALLERY_VIDEO_INVALID_TYPE_ERROR;
    }

    try {
      const duration = await getVideoDurationSeconds(file);
      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        return GALLERY_VIDEO_DURATION_ERROR;
      }
    } catch {
      return GALLERY_VIDEO_INVALID_TYPE_ERROR;
    }
  }

  return undefined;
}

export function formTextareaClassName(hasError: boolean): string {
  return [
    'min-h-[100px] w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors',
    hasError
      ? 'border-destructive focus:border-destructive focus:ring-4 focus:ring-destructive/10'
      : 'border-input focus:border-primary focus:ring-4 focus:ring-primary/10',
  ].join(' ');
}
