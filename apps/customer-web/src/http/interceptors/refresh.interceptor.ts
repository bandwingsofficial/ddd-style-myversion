import { AxiosInstance } from "axios";
import { refreshSession, logoutSession } from "@/features/customer-auth/api/session.api";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";

let isRefreshing = false;
let queue: Array<(success: boolean) => void> = [];

const resolveQueue = (success: boolean) => {
  queue.forEach((cb) => cb(success));
  queue = [];
};

export const attachRefreshInterceptor = (axios: AxiosInstance) => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status !== 401 ||
        originalRequest?._retry
      ) {
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
        await refreshSession("cookie");

        const sessionRes = await axios.get("/auth/session/me");
        useCustomerAuthStore
          .getState()
          .setSession(sessionRes.data.data);

        resolveQueue(true);
        return axios(originalRequest);
      } catch (err) {
        resolveQueue(false);
        useCustomerAuthStore.getState().clearSession();

        try {
          await logoutSession();
        } catch {}

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
  );
};
