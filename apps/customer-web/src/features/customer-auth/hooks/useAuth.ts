"use client";

import { useEffect } from "react";
import { useCustomerAuthStore } from "../store/auth.store";
import { useSession } from "./useSession";

export const useAuth = () => {
  const isAuthenticated = useCustomerAuthStore(
    (state) => state.isAuthenticated
  );
  const isHydrated = useCustomerAuthStore(
    (state) => state.isHydrated
  );

  const hydrateSession = useSession();

  useEffect(() => {
    if (!isHydrated) {
      hydrateSession();
    }
  }, [isHydrated, hydrateSession]);

  return {
    isLoggedIn: isAuthenticated,
    isHydrated,
  };
};
