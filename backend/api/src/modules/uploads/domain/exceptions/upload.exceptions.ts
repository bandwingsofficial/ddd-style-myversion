// src/modules/uploads/domain/exceptions/upload.exceptions.ts

import { ValidationError } from '../../../../common/errors';

export class UploadFailedError extends ValidationError {
  constructor(message = 'Upload failed', metadata?: Record<string, unknown>) {
    super('UPLOAD_FAILED', message, metadata);
  }
}

export class UploadDeleteFailedError extends ValidationError {
  constructor(
    message = 'Failed to delete uploaded object',
    metadata?: Record<string, unknown>,
  ) {
    super('UPLOAD_DELETE_FAILED', message, metadata);
  }
}

export class UploadMissingBucketError extends ValidationError {
  constructor(message = 'Storage bucket is not configured') {
    super('UPLOAD_MISSING_BUCKET', message);
  }
}

export class UploadInvalidFileError extends ValidationError {
  constructor(message = 'Invalid file', metadata?: Record<string, unknown>) {
    super('UPLOAD_INVALID_FILE', message, metadata);
  }
}

export class UploadFileTooLargeError extends ValidationError {
  constructor(
    message = 'File exceeds maximum allowed size',
    metadata?: Record<string, unknown>,
  ) {
    super('UPLOAD_FILE_TOO_LARGE', message, metadata);
  }
}

export class UploadAwsUnavailableError extends ValidationError {
  constructor(
    message = 'Storage service is unavailable',
    metadata?: Record<string, unknown>,
  ) {
    super('UPLOAD_AWS_UNAVAILABLE', message, metadata);
  }
}

export class UploadMissingCredentialsError extends ValidationError {
  constructor(message = 'Storage credentials are not configured') {
    super('UPLOAD_MISSING_CREDENTIALS', message);
  }
}

export class UploadInvalidContentTypeError extends ValidationError {
  constructor(
    message = 'Invalid content type',
    metadata?: Record<string, unknown>,
  ) {
    super('UPLOAD_INVALID_CONTENT_TYPE', message, metadata);
  }
}

export class UploadTooManyFilesError extends ValidationError {
  constructor(
    message = 'Too many files uploaded',
    metadata?: Record<string, unknown>,
  ) {
    super('UPLOAD_TOO_MANY_FILES', message, metadata);
  }
}

export class UploadObjectNotFoundError extends ValidationError {
  constructor(
    message = 'Uploaded object not found',
    metadata?: Record<string, unknown>,
  ) {
    super('UPLOAD_OBJECT_NOT_FOUND', message, metadata);
  }
}
