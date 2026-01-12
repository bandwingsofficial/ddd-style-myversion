// src/common/errors/session-errors.ts

import { AppError, ErrorMetadata } from './app-error';

export class SessionRevokedError extends AppError {
  constructor(metadata?: ErrorMetadata) {
    super(
      'SESSION_REVOKED',
      'Session has been revoked',
      metadata,
    );
  }
}

export class TokenReuseDetectedError extends AppError {
  constructor(metadata?: ErrorMetadata) {
    super(
      'TOKEN_REUSE_DETECTED',
      'Refresh token reuse detected',
      metadata,
    );
  }
}
