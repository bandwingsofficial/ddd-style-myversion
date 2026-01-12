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

    if (
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await refreshManager();
        return api(originalRequest);
      } catch {
        // refresh failed → logout
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  },
};
