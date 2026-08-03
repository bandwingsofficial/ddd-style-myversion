"use client";

import { useEffect } from "react";
import { useCustomerSession } from "./useCustomerSession";
import { useSession } from "./useSession";

export const useAuth = () => {
  const { isLoggedIn, isReady, isHydrated } = useCustomerSession();
  const hydrateSession = useSession();

  useEffect(() => {
    if (!isHydrated) {
      void hydrateSession();
    }
  }, [isHydrated, hydrateSession]);

  return {
    isLoggedIn,
    isHydrated,
    isReady,
  };
};
