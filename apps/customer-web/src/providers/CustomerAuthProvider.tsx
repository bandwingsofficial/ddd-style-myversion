"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/features/customer-auth/hooks/useSession";

export default function CustomerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchSession = useSession();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    fetchSession();
  }, [fetchSession]);

  return <>{children}</>;
}
