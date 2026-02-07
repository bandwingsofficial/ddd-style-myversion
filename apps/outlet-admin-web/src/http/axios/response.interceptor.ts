import { AxiosError, AxiosResponse } from 'axios';
import { refreshManager } from './refresh.manager';
import { api } from './instance';

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
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
};
