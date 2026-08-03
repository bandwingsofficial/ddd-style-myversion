// src/modules/uploads/services/upload-validation.service.ts

import { Injectable } from '@nestjs/common';

import {
  UPLOAD_ALLOWED_IMAGE_EXTENSIONS,
  UPLOAD_ALLOWED_IMAGE_MIME_TYPES,
  UPLOAD_DEFAULTS,
} from '../constants/upload.constants';
import {
  UploadFileTooLargeError,
  UploadTooManyFilesError,
} from '../domain/exceptions/upload.exceptions';
import { UploadFileInput } from '../interfaces/upload-file.interface';
import { ImageUploadValidator } from '../validators/image-upload.validator';

@Injectable()
export class UploadValidationService {
  validateSingleImage(
    file: UploadFileInput | undefined | null,
    options?: {
      allowedMimeTypes?: readonly string[];
      allowedExtensions?: readonly string[];
      maxSizeBytes?: number;
    },
  ): UploadFileInput {
    ImageUploadValidator.assertValidFile(file);

    const allowedMimeTypes =
      options?.allowedMimeTypes ?? UPLOAD_ALLOWED_IMAGE_MIME_TYPES;
    const allowedExtensions =
      options?.allowedExtensions ?? UPLOAD_ALLOWED_IMAGE_EXTENSIONS;
    const maxSizeBytes =
      options?.maxSizeBytes ?? UPLOAD_DEFAULTS.MAX_SINGLE_IMAGE_SIZE_BYTES;

    if (file.size > maxSizeBytes) {
      throw new UploadFileTooLargeError(
        `File exceeds maximum size of ${maxSizeBytes} bytes`,
        { size: file.size, maxSizeBytes },
      );
    }

    const contentType = ImageUploadValidator.detectContentType(
      file,
      allowedMimeTypes,
    );

    ImageUploadValidator.assertImageMimeType(contentType, allowedMimeTypes);
    ImageUploadValidator.assertImageExtension(
      file.originalname,
      allowedExtensions,
    );

    return file;
  }

  validateMultipleImages(
    files: UploadFileInput[] | undefined | null,
    options?: {
      allowedMimeTypes?: readonly string[];
      allowedExtensions?: readonly string[];
      maxSizeBytes?: number;
      maxFiles?: number;
    },
  ): UploadFileInput[] {
    if (!files?.length) {
      throw new UploadTooManyFilesError('At least one file is required');
    }

    const maxFiles = options?.maxFiles ?? UPLOAD_DEFAULTS.MAX_MULTIPLE_IMAGES;

    if (files.length > maxFiles) {
      throw new UploadTooManyFilesError(`Maximum ${maxFiles} files allowed`, {
        count: files.length,
        maxFiles,
      });
    }

    return files.map((file) => this.validateSingleImage(file, options));
  }
}
