// src/modules/uploads/providers/s3-storage.provider.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { S3_CLIENT } from '../constants/injection-tokens.constants';
import {
  IStorageProvider,
  PutObjectParams,
} from '../interfaces/storage-provider.interface';
import {
  DeleteMultipleObjectsOptions,
  DeleteObjectOptions,
  GeneratePresignedGetUrlOptions,
} from '../interfaces/upload-options.interface';
import {
  PresignedUrlResult,
  UploadResult,
} from '../interfaces/upload-result.interface';
import {
  UploadAwsUnavailableError,
  UploadDeleteFailedError,
  UploadFailedError,
  UploadMissingBucketError,
} from '../domain/exceptions/upload.exceptions';

@Injectable()
export class S3StorageProvider implements IStorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);

  constructor(
    @Inject(S3_CLIENT)
    private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async putObject(params: PutObjectParams): Promise<UploadResult> {
    const bucketName = this.getBucketName();

    try {
      const response = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: params.objectKey,
          Body: params.buffer,
          ContentType: params.contentType,
        }),
      );

      const presigned = await this.generatePresignedGetUrl({
        objectKey: params.objectKey,
      });

      return {
        objectKey: params.objectKey,
        presignedUrl: presigned.presignedUrl,
        publicUrl: this.buildPublicUrl(params.objectKey),
        mimeType: params.contentType,
        size: params.buffer.length,
        etag: response.ETag,
      };
    } catch (error) {
      this.logger.error(
        `Failed to upload object ${params.objectKey}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new UploadFailedError('Failed to upload object to storage', {
        objectKey: params.objectKey,
      });
    }
  }

  async deleteObject(params: DeleteObjectOptions): Promise<void> {
    const bucketName = this.getBucketName();

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: params.objectKey,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete object ${params.objectKey}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new UploadDeleteFailedError(
        'Failed to delete object from storage',
        { objectKey: params.objectKey },
      );
    }
  }

  async deleteMultipleObjects(
    params: DeleteMultipleObjectsOptions,
  ): Promise<void> {
    if (!params.objectKeys.length) {
      return;
    }

    const bucketName = this.getBucketName();

    try {
      await this.s3Client.send(
        new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: params.objectKeys.map((objectKey) => ({
              Key: objectKey,
            })),
            Quiet: true,
          },
        }),
      );
    } catch (error) {
      this.logger.error(
        'Failed to delete multiple objects',
        error instanceof Error ? error.stack : String(error),
      );
      throw new UploadDeleteFailedError(
        'Failed to delete objects from storage',
        { objectKeys: params.objectKeys },
      );
    }
  }

  async generatePresignedGetUrl(
    params: GeneratePresignedGetUrlOptions,
  ): Promise<PresignedUrlResult> {
    const bucketName = this.getBucketName();
    const expiresInSeconds =
      params.expiresInSeconds ??
      this.configService.get<number>('aws.presignedGetTtlSeconds') ??
      3600;

    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: params.objectKey,
      });

      const presignedUrl = await getSignedUrl(
        this.s3Client,
        command,
        { expiresIn: expiresInSeconds },
      );

      return {
        objectKey: params.objectKey,
        presignedUrl,
        publicUrl: this.buildPublicUrl(params.objectKey),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned GET URL for ${params.objectKey}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new UploadAwsUnavailableError(
        'Failed to generate presigned GET URL',
        { objectKey: params.objectKey },
      );
    }
  }

  private getBucketName(): string {
    const bucketName = this.configService.get<string>('aws.bucketName');

    if (!bucketName) {
      throw new UploadMissingBucketError();
    }

    return bucketName;
  }

  private buildPublicUrl(objectKey: string): string | undefined {
    const publicUrlBase = this.configService.get<string>(
      'aws.publicUrlBase',
    );

    if (!publicUrlBase) {
      return undefined;
    }

    return `${publicUrlBase.replace(/\/$/, '')}/${objectKey}`;
  }
}
