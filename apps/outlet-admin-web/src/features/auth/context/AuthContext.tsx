'use client';

import { createContext, useEffect, useState } from 'react';
import { outletAuthService } from '../services/auth.service';
import { AuthContextState, OutletSession } from '../types/auth.types';

export const AuthContext = createContext<AuthContextState>({
  session: null,
  loading: true,
  isAuthenticated: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<OutletSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    outletAuthService
      .getSession()
      .then(setSession)
      .finally(() => setLoading(false));
  }, []);

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
