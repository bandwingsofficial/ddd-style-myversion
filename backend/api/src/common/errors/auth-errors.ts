import { AppError, ErrorMetadata } from './app-error';

export class UnauthorizedError extends AppError {
  constructor(
    code = 'UNAUTHORIZED',
    message = 'Unauthorized',
    metadata?: ErrorMetadata,
  ) {
    super(code, message, metadata);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    code = 'FORBIDDEN',
    message = 'Forbidden',
    metadata?: ErrorMetadata,
  ) {
    super(code, message, metadata);
  }
}
