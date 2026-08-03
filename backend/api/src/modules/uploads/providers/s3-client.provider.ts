// src/modules/uploads/providers/s3-client.provider.ts

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

import { S3_CLIENT } from '../constants/injection-tokens.constants';
import { UploadMissingBucketError } from '../domain/exceptions/upload.exceptions';
import { UploadMissingCredentialsError } from '../domain/exceptions/upload.exceptions';

export const s3ClientProvider: Provider = {
  provide: S3_CLIENT,
  useFactory: (configService: ConfigService): S3Client => {
    const accessKeyId = configService.get<string>('aws.accessKeyId');
    const secretAccessKey = configService.get<string>('aws.secretAccessKey');
    const region = configService.get<string>('aws.region');
    const bucketName = configService.get<string>('aws.bucketName');

    if (!accessKeyId || !secretAccessKey) {
      throw new UploadMissingCredentialsError();
    }

    if (!region) {
      throw new UploadMissingCredentialsError('AWS region is not configured');
    }

    if (!bucketName) {
      throw new UploadMissingBucketError();
    }

    return new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  },
  inject: [ConfigService],
};
