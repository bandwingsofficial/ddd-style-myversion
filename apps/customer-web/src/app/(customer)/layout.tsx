"use client";

import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useCustomerAuthStore(
    (s) => s.isAuthenticated
  );

  return (
    <>
      {children}
      {!isAuthenticated && (
        <div className="text-xs text-gray-400">
          Browsing as Guest
        </div>
      )}
    </>
  );
}
