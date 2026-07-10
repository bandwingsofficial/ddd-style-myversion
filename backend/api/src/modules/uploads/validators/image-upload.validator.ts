// src/modules/uploads/validators/image-upload.validator.ts

import * as path from 'path';

import {
  UPLOAD_ALLOWED_IMAGE_EXTENSIONS,
  UPLOAD_ALLOWED_IMAGE_MIME_TYPES,
} from '../constants/upload.constants';
import {
  UploadInvalidContentTypeError,
  UploadInvalidFileError,
} from '../domain/exceptions/upload.exceptions';
import { UploadFileInput } from '../interfaces/upload-file.interface';

export class ImageUploadValidator {
  static assertValidFile(
    file: UploadFileInput | undefined | null,
  ): asserts file is UploadFileInput {
    if (!file) {
      throw new UploadInvalidFileError('File is required');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new UploadInvalidFileError('File buffer is empty');
    }

    if (!file.originalname?.trim()) {
      throw new UploadInvalidFileError('File name is required');
    }
  }

  static assertImageMimeType(
    mimeType: string,
    allowedMimeTypes: readonly string[] = UPLOAD_ALLOWED_IMAGE_MIME_TYPES,
  ): void {
    const normalized = mimeType.toLowerCase().trim();

    if (!allowedMimeTypes.includes(normalized)) {
      throw new UploadInvalidContentTypeError(
        `Content type "${mimeType}" is not allowed`,
        { mimeType, allowedMimeTypes },
      );
    }
  }

  static assertImageExtension(
    originalFilename: string,
    allowedExtensions: readonly string[] = UPLOAD_ALLOWED_IMAGE_EXTENSIONS,
  ): void {
    const extension = path
      .extname(originalFilename)
      .toLowerCase()
      .trim();

    if (!allowedExtensions.includes(extension)) {
      throw new UploadInvalidContentTypeError(
        `File extension "${extension || 'unknown'}" is not allowed`,
        { extension, allowedExtensions },
      );
    }
  }

  static detectContentType(
    file: UploadFileInput,
    allowedMimeTypes: readonly string[] = UPLOAD_ALLOWED_IMAGE_MIME_TYPES,
  ): string {
    const mimeType = file.mimetype?.toLowerCase().trim();

    if (mimeType && allowedMimeTypes.includes(mimeType)) {
      return mimeType;
    }

    const extension = path.extname(file.originalname).toLowerCase();
    const extensionToMime: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };

    const detected = extensionToMime[extension];

    if (!detected) {
      throw new UploadInvalidContentTypeError(
        'Unable to detect valid image content type',
        { originalname: file.originalname, mimetype: file.mimetype },
      );
    }

    return detected;
  }
}
