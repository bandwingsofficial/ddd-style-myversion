"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import FloatingCartBar from "@/components/customer/FloatingCartBar";
import BottomNav from "@/components/customer/BottomNav";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();

  const authRoutes = [
    "/login",
    "/verify-otp",
    "/signup",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage = authRoutes.some((route) => pathname?.startsWith(route));

  return (
    <div className="min-h-screen w-full overflow-x-clip">
      <Toaster richColors closeButton position="top-center" />
      {children}
      {!isAuthPage && <BottomNav />}
      {!isAuthPage && <FloatingCartBar />}
    </div>
  );
}
