// src/modules/uploads/services/upload.service.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';

import { STORAGE_PROVIDER } from '../constants/injection-tokens.constants';
import {
  UPLOAD_ALLOWED_IMAGE_EXTENSIONS,
  UPLOAD_ALLOWED_IMAGE_MIME_TYPES,
  UPLOAD_DEFAULTS,
  UPLOAD_MIME_TO_EXTENSION,
} from '../constants/upload.constants';
import { UploadResultModel } from '../domain/models/upload-result.model';
import { IStorageProvider } from '../interfaces/storage-provider.interface';
import {
  MulterUploadFile,
  UploadFileInput,
} from '../interfaces/upload-file.interface';
import {
  DeleteMultipleObjectsOptions,
  DeleteObjectOptions,
  GenerateObjectKeyOptions,
  GeneratePresignedGetUrlOptions,
  ReplaceImageOptions,
  UpdateImageOptions,
  UploadMultipleImagesOptions,
  UploadSingleImageOptions,
} from '../interfaces/upload-options.interface';
import { UploadResult } from '../interfaces/upload-result.interface';
import { UploadValidationService } from './upload-validation.service';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
    private readonly uploadValidationService: UploadValidationService,
  ) {}

  async uploadSingleImage(
    options: UploadSingleImageOptions,
  ): Promise<UploadResult> {
    const file = this.toUploadFileInput(options.file);

    this.uploadValidationService.validateSingleImage(file, {
      allowedMimeTypes: options.allowedMimeTypes,
      allowedExtensions: options.allowedExtensions,
      maxSizeBytes: options.maxSizeBytes,
    });

    const contentType = this.resolveContentType(
      file,
      options.allowedMimeTypes,
    );

    const objectKey = this.generateObjectKey({
      folder: options.folder,
      originalFilename: file.originalname,
      useUuidFilename: options.useUuidFilename,
    });

    const result = await this.storageProvider.putObject({
      objectKey,
      buffer: file.buffer,
      contentType,
    });

    return this.toUploadResultModel(result);
  }

  async uploadMultipleImages(
    options: UploadMultipleImagesOptions,
  ): Promise<UploadResult[]> {
    const files = options.files.map((file) =>
      this.toUploadFileInput(file),
    );

    this.uploadValidationService.validateMultipleImages(files, {
      allowedMimeTypes: options.allowedMimeTypes,
      allowedExtensions: options.allowedExtensions,
      maxSizeBytes: options.maxSizeBytes,
      maxFiles: options.maxFiles,
    });

    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await this.uploadSingleImage({
        folder: options.folder,
        file,
        allowedMimeTypes: options.allowedMimeTypes,
        allowedExtensions: options.allowedExtensions,
        maxSizeBytes: options.maxSizeBytes,
        useUuidFilename: options.useUuidFilename,
      });

      results.push(result);
    }

    return results;
  }

  async deleteObject(
    options: DeleteObjectOptions,
  ): Promise<void> {
    await this.storageProvider.deleteObject(options);
  }

  async deleteMultipleObjects(
    options: DeleteMultipleObjectsOptions,
  ): Promise<void> {
    await this.storageProvider.deleteMultipleObjects(options);
  }

  async updateImage(
    options: UpdateImageOptions,
  ): Promise<UploadResult> {
    const result = await this.uploadSingleImage({
      folder: options.folder,
      file: options.file,
      allowedMimeTypes: options.allowedMimeTypes,
      allowedExtensions: options.allowedExtensions,
      maxSizeBytes: options.maxSizeBytes,
      useUuidFilename: options.useUuidFilename,
    });

    if (options.existingObjectKey) {
      await this.deleteObjectSafe(options.existingObjectKey);
    }

    return result;
  }

  async replaceImage(
    options: ReplaceImageOptions,
  ): Promise<UploadResult> {
    return this.updateImage(options);
  }

  async generatePresignedGetUrl(
    options: GeneratePresignedGetUrlOptions,
  ): Promise<string> {
    const result =
      await this.storageProvider.generatePresignedGetUrl(options);

    return result.presignedUrl;
  }

  generateObjectKey(options: GenerateObjectKeyOptions): string {
    const normalizedFolder = options.folder.replace(/^\/+|\/+$/g, '');
    const useUuidFilename = options.useUuidFilename ?? true;
    const extension = this.resolveExtension(
      options.originalFilename,
    );

    const filename = useUuidFilename
      ? `${randomUUID()}${extension}`
      : this.sanitizeFilename(options.originalFilename);

    return `${normalizedFolder}/${UPLOAD_DEFAULTS.OBJECT_KEY_SEGMENT}/${filename}`;
  }

  private resolveContentType(
    file: UploadFileInput,
    allowedMimeTypes: readonly string[] = UPLOAD_ALLOWED_IMAGE_MIME_TYPES,
  ): string {
    const mimeType = file.mimetype?.toLowerCase().trim();

    if (mimeType && allowedMimeTypes.includes(mimeType)) {
      return mimeType;
    }

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const extensionToMime: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };

    return extensionToMime[extension] ?? mimeType ?? 'image/jpeg';
  }

  private resolveExtension(originalFilename: string): string {
    const extension = path
      .extname(originalFilename)
      .toLowerCase();

    if (
      extension &&
      UPLOAD_ALLOWED_IMAGE_EXTENSIONS.includes(
        extension as (typeof UPLOAD_ALLOWED_IMAGE_EXTENSIONS)[number],
      )
    ) {
      return extension;
    }

    return UPLOAD_MIME_TO_EXTENSION['image/jpeg'];
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  private toUploadFileInput(
    file: UploadFileInput | MulterUploadFile,
  ): UploadFileInput {
    return {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  private toUploadResultModel(result: UploadResult): UploadResult {
    return new UploadResultModel(result);
  }

  private async deleteObjectSafe(objectKey: string): Promise<void> {
    try {
      await this.deleteObject({ objectKey });
    } catch (error) {
      this.logger.warn(
        `Failed to delete object ${objectKey} during replace/update`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
