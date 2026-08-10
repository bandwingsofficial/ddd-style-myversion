import { logoutSession } from "../api/session.api";
import {
  beginSessionTermination,
  syncAfterLogout,
} from "../services/auth-sync.service";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();

  return async () => {
    // Stop refresh/retries before the logout request completes.
    beginSessionTermination();

    try {
      await logoutSession();
    } catch {
      // Session may already be gone; local cleanup still proceeds.
    } finally {
      syncAfterLogout();
      router.replace("/login");
    }
  };
};
