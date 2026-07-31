export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };

  const message = axiosError?.response?.data?.message;

  if (Array.isArray(message)) {
    return message[0] ?? fallback;
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (axiosError?.message?.trim()) {
    return axiosError.message;
  }

  return fallback;
}

export const UNEXPECTED_ERROR_TOAST =
  'Something happened. Please try again.';
