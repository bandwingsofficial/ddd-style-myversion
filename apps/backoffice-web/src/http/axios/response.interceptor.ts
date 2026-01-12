import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { refreshSession } from './refresh.manager';

/**
 * These endpoints must NEVER trigger refresh
 */
const AUTH_EXCLUDED_PATHS = [
  '/auth/super/login',
  '/auth/super/verify-mfa',
  '/auth/session/me', // 🔥 IMPORTANT
];

function isAuthExcluded(url?: string) {
  if (!url) return false;
  return AUTH_EXCLUDED_PATHS.some((p) =>
    url.includes(p),
  );
}

/**
 * Extend Axios config (Axios v1 safe)
 */
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
  }
}

export function attachResponseInterceptor(
  axios: AxiosInstance,
) {
  axios.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
      const status = error.response?.status;
      const originalRequest =
        error.config as InternalAxiosRequestConfig | undefined;

      if (!status || !originalRequest) {
        return Promise.reject(error);
      }

      const url = originalRequest.url;

      // 🚫 Never refresh on auth/session checks
      if (isAuthExcluded(url)) {
        return Promise.reject(error);
      }

      // 🚫 Explicit opt-out
      if (originalRequest.skipAuthRefresh) {
        return Promise.reject(error);
      }

      // 🔁 Handle access token expiry
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await refreshSession(axios);
          return axios(originalRequest);
        } catch {
          // ❌ DO NOT redirect here
          // AuthProvider will handle logout
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    },
  );
}
