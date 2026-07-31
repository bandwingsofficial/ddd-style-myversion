import { useCallback, useEffect, useState } from "react";
import { fetchSession } from "../api/session.api";
import { useCustomerAuthStore } from "../store/auth.store";

export const useSession = () => {
  const setSession = useCustomerAuthStore((state) => state.setSession);
  const clearSession = useCustomerAuthStore((state) => state.clearSession);
  const markSessionChecked = useCustomerAuthStore(
    (state) => state.markSessionChecked,
  );

  return useCallback(async () => {
    try {
      const res = await fetchSession();
      setSession(res.data.data);
    } catch {
      clearSession();
    } finally {
      markSessionChecked();
    }
  }, [clearSession, markSessionChecked, setSession]);
};
