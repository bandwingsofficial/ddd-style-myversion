import type { AxiosError } from 'axios';

export interface ApiErrorPayload {
  success: false;
  code: string;
  message: string;
  metadata?: Record<string, any> | null;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly metadata?: Record<string, any> | null;

  constructor(
    status: number,
    code: string,
    message: string,
    metadata?: Record<string, any> | null,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.metadata = metadata ?? null;
  }
}

/**
 * Converts AxiosError → ApiError
 * (NestJS-compatible, TS-safe)
 */
export function parseApiError(
  error: unknown,
): ApiError {
  const isDev =
    process.env.NODE_ENV === 'development';

  if (
    typeof error === 'object' &&
    error !== null &&
    (error as AxiosError).isAxiosError
  ) {
    const axiosError =
      error as AxiosError<any>;

    const status =
      axiosError.response?.status ?? 500;

    const data = axiosError.response?.data;

    // ─────────────────────────────────────────────
    // CASE 1: Your backend wrapped error
    // { success:false, code, message, metadata }
    // ─────────────────────────────────────────────
    if (
      data &&
      typeof data === 'object' &&
      typeof (data as any).code === 'string' &&
      typeof (data as any).message === 'string'
    ) {
      return new ApiError(
        status,
        (data as any).code,
        (data as any).message,
        (data as any).metadata ?? null,
      );
    }

    // ─────────────────────────────────────────────
    // CASE 2: NestJS validation / HttpException
    // { message: string | string[] }
    // ─────────────────────────────────────────────
    if (
      data &&
      typeof data === 'object' &&
      (data as any).message
    ) {
      const rawMessage = (data as any)
        .message;

      const message = Array.isArray(
        rawMessage,
      )
        ? rawMessage.join(', ')
        : String(rawMessage);

      return new ApiError(
        status,
        'REQUEST_FAILED',
        message,
      );
    }

    // ─────────────────────────────────────────────
    // CASE 3: Unknown backend response
    // ─────────────────────────────────────────────
    return new ApiError(
      status,
      'UNKNOWN_BACKEND_ERROR',
      'Request failed',
    );
  }

  // Non-Axios / unexpected error
  return new ApiError(
    500,
    'UNKNOWN_ERROR',
    'Something went wrong',
  );
}
