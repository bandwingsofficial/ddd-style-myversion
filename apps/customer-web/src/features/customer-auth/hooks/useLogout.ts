import { logoutSession } from "../api/session.api";
import { syncAfterLogout } from "../services/auth-sync.service";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();

  return async () => {
    try {
      await logoutSession();
    } finally {
      syncAfterLogout();
      router.replace("/login");
    }
  };
};
