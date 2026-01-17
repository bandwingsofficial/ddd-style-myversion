import { logoutSession } from "../api/session.api";
import { useCustomerAuthStore } from "../store/auth.store";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();
  const clearSession = useCustomerAuthStore(
    (state) => state.clearSession
  );

  return async () => {
    try {
      await logoutSession(); // backend clears cookies
    } finally {
      clearSession();
      router.replace("/login");
    }
  };
};
