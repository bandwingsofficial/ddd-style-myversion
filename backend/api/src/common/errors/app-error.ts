// src/common/errors/app-error.ts

export type ErrorMetadata = Record<string, any>;

export abstract class AppError extends Error {
  readonly code: string;
  readonly metadata?: ErrorMetadata;

  protected constructor(
    code: string,
    message: string,
    metadata?: ErrorMetadata,
  ) {
    super(message);
    this.code = code;
    this.metadata = metadata;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
