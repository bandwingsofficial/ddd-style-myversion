import { AxiosInstance, AxiosError } from "axios";
import { refreshSession, logoutSession } from "@/features/customer-auth/api/session.api";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";

let isRefreshing = false;
let queue: Array<(success: boolean) => void> = [];

const resolveQueue = (success: boolean) => {
  queue.forEach((cb) => cb(success));
  queue = [];
};

function getErrorCode(error: AxiosError): string | undefined {
  const data = error.response?.data as { code?: string; message?: string | string[] } | undefined;
  const message = data?.message;
  if (typeof message === "string") return data?.code ?? message;
  if (Array.isArray(message) && message.length > 0) return data?.code ?? message[0];
  return data?.code;
}

export const attachRefreshInterceptor = (axios: AxiosInstance) => {
  axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as (typeof error.config & { _retry?: boolean });

      if (!originalRequest) {
        return Promise.reject(error);
      }

      const status = error.response?.status;
      const errorCode = getErrorCode(error);

      if (status === 403 && errorCode === "INSUFFICIENT_ROLE") {
        useCustomerAuthStore.getState().clearSession();
        try {
          await logoutSession();
        } catch {
          // ignore
        }
        return Promise.reject(error);
      }

      const shouldAttemptRefresh =
        (status === 401 || (status === 403 && errorCode === "ACCESS_DENIED")) &&
        !originalRequest._retry;

      if (!shouldAttemptRefresh) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push((success) => {
            success
              ? resolve(axios(originalRequest))
              : reject(error);
          });
        });
      }

      isRefreshing = true;

      try {
        await refreshSession();

        const sessionRes = await axios.get("/auth/session/me");
        useCustomerAuthStore
          .getState()
          .setSession(sessionRes.data.data);

        resolveQueue(true);
        return axios(originalRequest);
      } catch (refreshError) {
        resolveQueue(false);
        useCustomerAuthStore.getState().clearSession();

        try {
          await logoutSession();
        } catch {
          // ignore
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    },
  );
};
