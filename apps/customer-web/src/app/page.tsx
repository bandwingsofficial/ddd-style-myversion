"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";

export default function EntryPage() {
  const router = useRouter();
  const isAuthenticated = useCustomerAuthStore(
    (state) => state.isAuthenticated
  );

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/home");
    } else {
      router.replace("/home");
    }
  }, [isAuthenticated]);

  return null;
}
