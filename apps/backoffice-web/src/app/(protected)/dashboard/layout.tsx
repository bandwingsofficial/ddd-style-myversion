'use client';

import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const { ready, authenticated, actorType } = useAuth();

  useEffect(() => {
    if (!ready) return;

    // Not logged in → login
    if (!authenticated) {
      router.replace('/login');
      return;
    }

    // Logged in but wrong role → block
    if (actorType !== 'SUPER_ADMIN') {
      router.replace('/unauthorized'); // or /logout
    }
  }, [ready, authenticated, actorType, router]);

  // Block rendering until allowed
  if (!ready || !authenticated || actorType !== 'SUPER_ADMIN') {
    return null;
  }

  return <>{children}</>;
}
