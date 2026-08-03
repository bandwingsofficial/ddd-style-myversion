// src/modules/uploads/validators/multer-memory.options.ts

import multer from 'multer';
import { Options as MulterOptions } from 'multer';

import { UPLOAD_DEFAULTS } from '../constants/upload.constants';

export interface MemoryImageUploadOptionsConfig {
  maxFileSizeBytes?: number;
}

export function createMemoryImageUploadOptions(
  config: MemoryImageUploadOptionsConfig = {},
): MulterOptions {
  return {
    storage: multer.memoryStorage(),
    limits: {
      fileSize:
        config.maxFileSizeBytes ?? UPLOAD_DEFAULTS.MAX_SINGLE_IMAGE_SIZE_BYTES,
    },
  };
}

export const categoryImageUploadOptions = createMemoryImageUploadOptions({
  maxFileSizeBytes: 10 * 1024 * 1024,
});

export const productImageUploadOptions = createMemoryImageUploadOptions({
  maxFileSizeBytes: UPLOAD_DEFAULTS.MAX_SINGLE_IMAGE_SIZE_BYTES,
});
