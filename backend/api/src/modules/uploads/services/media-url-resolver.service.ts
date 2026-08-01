import { Injectable } from '@nestjs/common';

import { UploadService } from './upload.service';

export interface ResolveProductImageParams {
  snapshotImage?: string | null;
  mainImage?: string | null;
  galleryImageKeys?: string[];
}

@Injectable()
export class MediaUrlResolverService {
  constructor(private readonly uploadService: UploadService) {}

  async resolveImageRef(imageRef?: string | null): Promise<string> {
    if (!imageRef?.trim()) {
      return '';
    }

    if (
      imageRef.startsWith('http://') ||
      imageRef.startsWith('https://')
    ) {
      return imageRef;
    }

    try {
      return await this.uploadService.generatePresignedGetUrl({
        objectKey: imageRef,
      });
    } catch {
      return '';
    }
  }

  /** Snapshot → product main → first gallery image, using presigned/CDN URLs. */
  async resolveProductImage(
    params: ResolveProductImageParams,
  ): Promise<string> {
    const candidates = [
      params.snapshotImage,
      params.mainImage,
      ...(params.galleryImageKeys ?? []),
    ].filter((value): value is string => !!value?.trim());

    for (const candidate of candidates) {
      const resolved = await this.resolveImageRef(candidate);
      if (resolved) {
        return resolved;
      }
    }

    return '';
  }
}
