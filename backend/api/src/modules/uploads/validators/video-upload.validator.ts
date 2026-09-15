import * as path from 'path';

import { ValidationError } from '../../../common/errors';
import {
  UPLOAD_ALLOWED_VIDEO_EXTENSIONS,
  UPLOAD_ALLOWED_VIDEO_MIME_TYPES,
} from '../constants/upload.constants';
import { UploadFileInput } from '../interfaces/upload-file.interface';
import { ImageUploadValidator } from './image-upload.validator';

export class VideoUploadValidator {
  static assertValidFile(file: UploadFileInput | undefined | null): void {
    ImageUploadValidator.assertValidFile(file);
  }

  static detectContentType(
    file: UploadFileInput,
    allowedMimeTypes: readonly string[] = UPLOAD_ALLOWED_VIDEO_MIME_TYPES,
  ): string {
    const mimeType = file.mimetype?.toLowerCase().trim();

    if (mimeType && allowedMimeTypes.includes(mimeType)) {
      return mimeType;
    }

    const extension = path.extname(file.originalname).toLowerCase();
    const extensionToMime: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
    };

    const detected = extensionToMime[extension];

    if (!detected) {
      throw new ValidationError(
        'UPLOAD_INVALID_CONTENT_TYPE',
        'Unable to detect valid video content type',
        { originalname: file.originalname, mimetype: file.mimetype },
      );
    }

    return detected;
  }

  static assertVideoMimeType(
    contentType: string,
    allowedMimeTypes: readonly string[] = UPLOAD_ALLOWED_VIDEO_MIME_TYPES,
  ): void {
    if (!allowedMimeTypes.includes(contentType)) {
      throw new ValidationError(
        'UPLOAD_INVALID_CONTENT_TYPE',
        'Invalid video content type',
        {
          contentType,
          allowedMimeTypes: [...allowedMimeTypes],
        },
      );
    }
  }

  static assertVideoExtension(
    filename: string,
    allowedExtensions: readonly string[] = UPLOAD_ALLOWED_VIDEO_EXTENSIONS,
  ): void {
    const extension = path.extname(filename).toLowerCase().trim();

    if (!allowedExtensions.includes(extension as (typeof allowedExtensions)[number])) {
      throw new ValidationError(
        'UPLOAD_INVALID_CONTENT_TYPE',
        'Invalid video file extension',
        {
          extension,
          allowedExtensions: [...allowedExtensions],
        },
      );
    }
  }
}
