// src/modules/uploads/interfaces/storage-provider.interface.ts

import {
  DeleteMultipleObjectsOptions,
  DeleteObjectOptions,
  GeneratePresignedGetUrlOptions,
} from './upload-options.interface';
import { PresignedUrlResult, UploadResult } from './upload-result.interface';

export interface PutObjectParams {
  objectKey: string;
  buffer: Buffer;
  contentType: string;
}

export interface IStorageProvider {
  putObject(params: PutObjectParams): Promise<UploadResult>;

  deleteObject(params: DeleteObjectOptions): Promise<void>;

  deleteMultipleObjects(params: DeleteMultipleObjectsOptions): Promise<void>;

  generatePresignedGetUrl(
    params: GeneratePresignedGetUrlOptions,
  ): Promise<PresignedUrlResult>;
}
