// src/modules/uploads/constants/upload.constants.ts

export const UPLOAD_DEFAULTS = {
  MAX_SINGLE_IMAGE_SIZE_BYTES: 40 * 1024 * 1024,
  MAX_MULTIPLE_IMAGE_SIZE_BYTES: 40 * 1024 * 1024,
  MAX_MULTIPLE_IMAGES: 10,
  PRESIGNED_GET_TTL_SECONDS: 3600,
  OBJECT_KEY_SEGMENT: 'image',
} as const;

export const UPLOAD_ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const UPLOAD_ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
] as const;

export const UPLOAD_MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
