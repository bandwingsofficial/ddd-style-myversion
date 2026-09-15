// src/modules/uploads/services/upload-validation.service.ts

import { Injectable } from '@nestjs/common';

import { ValidationError } from '../../../common/errors';
import {
  UPLOAD_ALLOWED_IMAGE_EXTENSIONS,
  UPLOAD_ALLOWED_IMAGE_MIME_TYPES,
  UPLOAD_ALLOWED_VIDEO_EXTENSIONS,
  UPLOAD_ALLOWED_VIDEO_MIME_TYPES,
  UPLOAD_DEFAULTS,
} from '../constants/upload.constants';
import {
  UploadFileTooLargeError,
  UploadInvalidContentTypeError,
  UploadTooManyFilesError,
} from '../domain/exceptions/upload.exceptions';
import { extractVideoDurationSeconds } from '../utils/video-duration.util';
import { VideoUploadValidator } from '../validators/video-upload.validator';
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

  validateSingleVideo(
    file: UploadFileInput | undefined | null,
    options?: {
      allowedMimeTypes?: readonly string[];
      allowedExtensions?: readonly string[];
      maxSizeBytes?: number;
      maxDurationSeconds?: number;
    },
  ): { file: UploadFileInput; durationSeconds: number | null } {
    VideoUploadValidator.assertValidFile(file);

    const allowedMimeTypes =
      options?.allowedMimeTypes ?? UPLOAD_ALLOWED_VIDEO_MIME_TYPES;
    const allowedExtensions =
      options?.allowedExtensions ?? UPLOAD_ALLOWED_VIDEO_EXTENSIONS;
    const maxSizeBytes =
      options?.maxSizeBytes ?? UPLOAD_DEFAULTS.MAX_SINGLE_VIDEO_SIZE_BYTES;
    const maxDurationSeconds =
      options?.maxDurationSeconds ?? UPLOAD_DEFAULTS.MAX_VIDEO_DURATION_SECONDS;

    if (file.size > maxSizeBytes) {
      throw new UploadFileTooLargeError(
        `File exceeds maximum size of ${maxSizeBytes} bytes`,
        { size: file.size, maxSizeBytes },
      );
    }

    const contentType = VideoUploadValidator.detectContentType(
      file,
      allowedMimeTypes,
    );

    VideoUploadValidator.assertVideoMimeType(contentType, allowedMimeTypes);
    VideoUploadValidator.assertVideoExtension(
      file.originalname,
      allowedExtensions,
    );

    const parsedDuration = extractVideoDurationSeconds(file.buffer, contentType);
    const durationSeconds =
      parsedDuration != null ? Math.ceil(parsedDuration) : null;

    if (durationSeconds != null && durationSeconds > maxDurationSeconds) {
      throw new ValidationError(
        'VIDEO_DURATION_EXCEEDED',
        'Video duration must be 1 minute or less.',
        { durationSeconds, maxDurationSeconds },
      );
    }

    return { file, durationSeconds };
  }

  isVideoFile(file: UploadFileInput): boolean {
    const mimeType = file.mimetype?.toLowerCase().trim() ?? '';
    if (UPLOAD_ALLOWED_VIDEO_MIME_TYPES.includes(mimeType as (typeof UPLOAD_ALLOWED_VIDEO_MIME_TYPES)[number])) {
      return true;
    }

    const extension = file.originalname
      .slice(file.originalname.lastIndexOf('.'))
      .toLowerCase();

    return UPLOAD_ALLOWED_VIDEO_EXTENSIONS.includes(
      extension as (typeof UPLOAD_ALLOWED_VIDEO_EXTENSIONS)[number],
    );
  }
}
