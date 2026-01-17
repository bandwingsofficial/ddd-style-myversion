import { fetchSession } from "../api/session.api";
import { useCustomerAuthStore } from "../store/auth.store";

export const useSession = () => {
  const setSession = useCustomerAuthStore(
    (state) => state.setSession
  );

  return async () => {
    try {
      const res = await fetchSession();
      setSession(res.data.data);
    } catch {
      // silent fail → guest user
    }
  };
};
