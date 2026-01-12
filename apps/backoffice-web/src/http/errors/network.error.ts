import axios from 'axios';

export class NetworkError extends Error {
  readonly code: string;

  constructor(message = 'Network error') {
    super(message);
    this.code = 'NETWORK_ERROR';
  }
}

/**
 * Detects network-level failures
 * (request made, no HTTP response received)
 */
export function isNetworkError(
  error: unknown,
): boolean {
  return (
    axios.isAxiosError(error) &&
    !error.response
  );
}
