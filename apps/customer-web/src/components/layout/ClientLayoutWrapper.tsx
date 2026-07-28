"use client";

import React from "react";
import { usePathname } from "next/navigation";
import FloatingCartBar from "@/components/customer/FloatingCartBar";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();

  // Define routes where the floating cart bar should NOT appear
  const authRoutes = ["/login", "/signup", "/register", "/forgot-password", "/reset-password"];
  const isAuthPage = authRoutes.some((route) => pathname?.startsWith(route));

  return (
    <>
      {children}
      {!isAuthPage && <FloatingCartBar />}
    </>
  );
}