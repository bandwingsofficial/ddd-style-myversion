import { AxiosError, AxiosResponse } from 'axios';
import { refreshManager } from './refresh.manager';
import { api } from './instance';

const FORCED_LOGOUT_CODES = new Set([
  'OUTLET_INACTIVE',
  'ACCOUNT_INACTIVE',
  'SESSION_INVALID',
  'SESSION_REVOKED',
]);

const FORCED_LOGOUT_MESSAGES: Record<string, string> = {
  OUTLET_INACTIVE: 'This outlet has been disabled by the administrator.',
  ACCOUNT_INACTIVE:
    'Your account has been disabled. Please contact the administrator.',
  SESSION_INVALID: 'Your session has expired. Please log in again.',
  SESSION_REVOKED: 'Your session has expired. Please log in again.',
};

function extractErrorCode(error: AxiosError): string | undefined {
  const data = error.response?.data as
    | { code?: string; message?: string | string[] }
    | undefined;

  if (!data) {
    return undefined;
  }

  if (typeof data.code === 'string') {
    return data.code;
  }

  if (typeof data.message === 'string') {
    return data.message;
  }

  if (Array.isArray(data.message) && typeof data.message[0] === 'string') {
    return data.message[0];
  }

  return undefined;
}

function redirectToLogin(code?: string): void {
  const message =
    (code && FORCED_LOGOUT_MESSAGES[code]) ||
    (code && FORCED_LOGOUT_CODES.has(code) ? code : undefined);

  const url = message
    ? `/auth/login?message=${encodeURIComponent(message)}`
    : '/auth/login';

  window.location.href = url;
}

export const responseInterceptor = {
  onFulfilled: (response: AxiosResponse) => response,

  onRejected: async (error: AxiosError) => {
    if (!error.response || typeof window === 'undefined') {
      return Promise.reject(error);
    }

    const originalRequest: any = error.config;
    const status = error.response.status;
    const url = originalRequest?.url || '';
    const pathname = window.location.pathname;
    const errorCode = extractErrorCode(error);

    if (errorCode && FORCED_LOGOUT_CODES.has(errorCode)) {
      redirectToLogin(errorCode);
      return Promise.reject(error);
    }

    // 🚨 HARD STOPS — NEVER REFRESH IN THESE CASES
    if (
      pathname.startsWith('/auth') ||               // login page
      url.includes('/auth/outlets/login') ||        // login API
      url.includes('/auth/session/refresh') ||      // refresh API itself
      originalRequest._retry                        // already retried
    ) {
      return Promise.reject(error);
    }

    // ✅ Refresh ONLY for protected APIs
    if (status === 401) {
      originalRequest._retry = true;

      try {
        await refreshManager();
        return api(originalRequest);
      } catch {
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    if (status === 403 && errorCode === 'OUTLET_INACTIVE') {
      redirectToLogin(errorCode);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
};
