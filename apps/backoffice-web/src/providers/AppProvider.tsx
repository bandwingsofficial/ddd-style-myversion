'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { HttpProvider } from './HttpProvider';
import { AuthProvider } from '@/features/auth/context/AuthProvider';
import { useSession } from '@/features/auth/hooks/useSession';

function BootstrapAuth({ children }: PropsWithChildren) {
  const { fetchSession } = useSession();
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    void (async () => {
      try {
        await fetchSession();
      } catch (err) {
        console.error('[AuthBootstrap] fetchSession failed:', err);
      }
    })();
  }, [fetchSession]);

  return <>{children}</>;
}

export function AppProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HttpProvider>
        <AuthProvider>
          <BootstrapAuth>
            {children}
            <Toaster richColors position="top-right" />
          </BootstrapAuth>
        </AuthProvider>
      </HttpProvider>
    </QueryClientProvider>
  );
}
