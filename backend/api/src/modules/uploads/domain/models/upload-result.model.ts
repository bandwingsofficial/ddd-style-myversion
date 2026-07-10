// src/modules/uploads/domain/models/upload-result.model.ts

export class UploadResultModel {
  readonly objectKey: string;
  readonly presignedUrl?: string;
  readonly publicUrl?: string;
  readonly mimeType: string;
  readonly size: number;
  readonly etag?: string;

  constructor(params: {
    objectKey: string;
    presignedUrl?: string;
    publicUrl?: string;
    mimeType: string;
    size: number;
    etag?: string;
  }) {
    this.objectKey = params.objectKey;
    this.presignedUrl = params.presignedUrl;
    this.publicUrl = params.publicUrl;
    this.mimeType = params.mimeType;
    this.size = params.size;
    this.etag = params.etag;
    Object.freeze(this);
  }
}
