// src/modules/uploads/constants/upload.constants.ts

export const UPLOAD_DEFAULTS = {
  MAX_SINGLE_IMAGE_SIZE_BYTES: 40 * 1024 * 1024,
  MAX_SINGLE_VIDEO_SIZE_BYTES: 100 * 1024 * 1024,
  MAX_MULTIPLE_IMAGE_SIZE_BYTES: 40 * 1024 * 1024,
  MAX_MULTIPLE_IMAGES: 10,
  MAX_GALLERY_VIDEOS: 5,
  MAX_VIDEO_DURATION_SECONDS: 60,
  PRESIGNED_GET_TTL_SECONDS: 3600,
  OBJECT_KEY_SEGMENT: 'image',
  VIDEO_KEY_SEGMENT: 'video',
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
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};

export const UPLOAD_ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
] as const;

export const UPLOAD_ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm'] as const;
