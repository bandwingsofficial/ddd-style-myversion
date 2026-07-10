// src/modules/uploads/interfaces/upload-options.interface.ts

import { UploadFileInput } from './upload-file.interface';

export interface UploadSingleImageOptions {
  folder: string;
  file: UploadFileInput;
  allowedMimeTypes?: readonly string[];
  allowedExtensions?: readonly string[];
  maxSizeBytes?: number;
  useUuidFilename?: boolean;
}

export interface UploadMultipleImagesOptions {
  folder: string;
  files: UploadFileInput[];
  allowedMimeTypes?: readonly string[];
  allowedExtensions?: readonly string[];
  maxSizeBytes?: number;
  maxFiles?: number;
  useUuidFilename?: boolean;
}

export interface UpdateImageOptions {
  folder: string;
  file: UploadFileInput;
  existingObjectKey?: string;
  allowedMimeTypes?: readonly string[];
  allowedExtensions?: readonly string[];
  maxSizeBytes?: number;
  useUuidFilename?: boolean;
}

export interface ReplaceImageOptions extends UpdateImageOptions {}

export interface GenerateObjectKeyOptions {
  folder: string;
  originalFilename: string;
  useUuidFilename?: boolean;
}

export interface GeneratePresignedGetUrlOptions {
  objectKey: string;
  expiresInSeconds?: number;
}

export interface DeleteObjectOptions {
  objectKey: string;
}

export interface DeleteMultipleObjectsOptions {
  objectKeys: string[];
}
