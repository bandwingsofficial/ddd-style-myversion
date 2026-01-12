import { AppError, ErrorMetadata } from './app-error';

export class ValidationError extends AppError {
  constructor(
    code: string,
    message: string,
    metadata?: ErrorMetadata,
  ) {
    super(code, message, metadata);
  }
}
  export class InvariantViolationError extends AppError {
  constructor(
    code: string,
    message: string,
    metadata?: ErrorMetadata,
  ) {
    super(code, message, metadata);
  }

}
