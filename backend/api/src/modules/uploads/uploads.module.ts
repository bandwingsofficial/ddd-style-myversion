// src/modules/uploads/uploads.module.ts

import { Module } from '@nestjs/common';

import { STORAGE_PROVIDER } from './constants/injection-tokens.constants';
import { s3ClientProvider } from './providers/s3-client.provider';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { UploadService } from './services/upload.service';
import { UploadValidationService } from './services/upload-validation.service';

@Module({
  providers: [
    s3ClientProvider,
    {
      provide: STORAGE_PROVIDER,
      useClass: S3StorageProvider,
    },
    UploadValidationService,
    UploadService,
  ],
  exports: [UploadService],
})
export class UploadsModule {}
