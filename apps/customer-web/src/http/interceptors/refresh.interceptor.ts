import { AxiosError, AxiosInstance } from "axios";

import {
  refreshSession,
  logoutSession,
} from "@/features/customer-auth/api/session.api";

import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";

import {
  handleAuthInvalidated,
} from "@/features/customer-auth/services/auth-sync.service";

let isRefreshing = false;

let queue: Array<(success: boolean) => void> = [];

const resolveQueue = (success: boolean) => {
  queue.forEach((callback) => callback(success));
  queue = [];
};

function getErrorCode(error: AxiosError): string | undefined {
  const data = error.response?.data as
    | {
        code?: string;
        message?: string | string[];
      }
    | undefined;

  const message = data?.message;

  if (typeof message === "string") {
    return data?.code ?? message;
  }

  if (Array.isArray(message) && message.length > 0) {
    return data?.code ?? message[0];
  }

  return data?.code;
}

function devLog(
  event: string,
  payload: Record<string, unknown>
) {
  if (process.env.NODE_ENV === "production") return;

  console.info("[auth-refresh]", {
    event,
    ...payload,
  });
}

export const attachRefreshInterceptor = (
  client: AxiosInstance
) => {
  client.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
      const originalRequest = error.config as
        | (typeof error.config & {
            _retry?: boolean;
          })
        | undefined;

      if (!originalRequest) {
        return Promise.reject(error);
      }

      const status = error.response?.status;
      const errorCode = getErrorCode(error);
      const requestUrl = originalRequest.url ?? "";

      /*
       * IMPORTANT:
       * Do not attempt a token/session refresh for the
       * refresh or logout endpoints themselves.
       *
       * Otherwise a failed refresh request could trigger
       * another refresh request and create a loop.
       */
      const isAuthEndpoint =
        requestUrl.includes("/auth/session/refresh") ||
        requestUrl.includes("/auth/session/logout");

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      /*
       * Insufficient role is an authorization problem,
       * not an expired session.
       */
      if (
        status === 403 &&
        errorCode === "INSUFFICIENT_ROLE"
      ) {
        devLog("insufficient_role", {
          url: requestUrl,
        });

        handleAuthInvalidated();

        try {
          await logoutSession();
        } catch {
          // Ignore logout failure.
        }

        return Promise.reject(error);
      }

      /*
       * Attempt session refresh only for authentication
       * failures.
       */
      const shouldAttemptRefresh =
        (status === 401 ||
          (status === 403 &&
            errorCode === "ACCESS_DENIED")) &&
        !originalRequest._retry;

      if (!shouldAttemptRefresh) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      /*
       * If another request is already refreshing the session,
       * wait for that refresh to finish.
       */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push((success) => {
            if (!success) {
              reject(error);
              return;
            }

            /*
             * IMPORTANT:
             * Retry with the configured client.
             *
             * Do NOT use plain axios(originalRequest).
             */
            client(originalRequest)
              .then(resolve)
              .catch(reject);
          });
        });
      }

      isRefreshing = true;

      devLog("refresh_start", {
        url: requestUrl,
      });

      try {
        /*
         * Refresh the HttpOnly session cookie.
         *
         * refreshSession() already uses customerAxios,
         * which has withCredentials: true.
         */
        await refreshSession();

        devLog("refresh_success", {});

        /*
         * IMPORTANT:
         * Use the SAME configured Axios instance here.
         *
         * This preserves:
         * - baseURL
         * - withCredentials: true
         * - x-client-type: web
         */
        const sessionRes = await client.get(
          "/auth/session/me"
        );

        useCustomerAuthStore
          .getState()
          .setSession(sessionRes.data.data);

        /*
         * Tell all queued requests that refresh succeeded.
         */
        resolveQueue(true);

        /*
         * Retry the original failed request with the
         * configured customer Axios instance.
         */
        return client(originalRequest);
      } catch (refreshError) {
        devLog("refresh_failed", {
          error: String(refreshError),
        });

        /*
         * Tell all queued requests that refresh failed.
         */
        resolveQueue(false);

        /*
         * Clear local authentication state.
         */
        handleAuthInvalidated();

        /*
         * Try to invalidate the server session too.
         */
        try {
          await logoutSession();
        } catch {
          // Ignore logout failure.
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
};