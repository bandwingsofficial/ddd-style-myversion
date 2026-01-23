"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useCustomerAuthStore();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login?redirect=/checkout");
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated) return null;

  return <h1>Checkout Page</h1>;
}
