'use client';

import { createContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { outletAuthService } from '../services/auth.service';
import { AuthContextState, OutletSession } from '../types/auth.types';

export const AuthContext = createContext<AuthContextState>({
  session: null,
  loading: true,
  isAuthenticated: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [session, setSession] = useState<OutletSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🚫 DO NOT check session on auth pages
    if (pathname.startsWith('/auth')) {
      setLoading(false);
      return;
    }

    outletAuthService
      .getSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        isAuthenticated: !!session
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
