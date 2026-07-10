// src/modules/uploads/interfaces/upload-result.interface.ts

export interface UploadResult {
  objectKey: string;
  presignedUrl?: string;
  publicUrl?: string;
  mimeType: string;
  size: number;
  etag?: string;
}

export interface PresignedUrlResult {
  objectKey: string;
  presignedUrl: string;
  publicUrl?: string;
}
