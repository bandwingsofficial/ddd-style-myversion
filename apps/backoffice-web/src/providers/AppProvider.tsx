'use client';

import { PropsWithChildren, useEffect, useRef } from 'react';
import { HttpProvider } from './HttpProvider';
import { AuthProvider } from '@/features/auth/context/AuthProvider';
import { useSession } from '@/features/auth/hooks/useSession';

/**
 * Bootstraps auth session ONCE globally
 */
function BootstrapAuth({ children }: PropsWithChildren) {
  const { fetchSession } = useSession();
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    // 🔒 Async wrapper ensures future safety
    (async () => {
      try {
        await fetchSession();
      } catch (err) {
        console.error('[AuthBootstrap] fetchSession failed:', err);
      }
    })();
  }, [fetchSession]);

  return <>{children}</>;
}

/**
 * AppProvider
 *
 * - HttpProvider → AuthProvider → BootstrapAuth
 * - Global providers for the app
 */
export function AppProvider({ children }: PropsWithChildren) {
  return (
    <HttpProvider>
      <AuthProvider>
        <BootstrapAuth>
          {children}
        </BootstrapAuth>
      </AuthProvider>
    </HttpProvider>
  );
}
