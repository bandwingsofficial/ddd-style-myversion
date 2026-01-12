'use client';

import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';

/**
 * AuthLayout
 *
 * - Guest-only pages (login, MFA)
 * - Redirects authenticated users to /dashboard
 */
export default function AuthLayout({
  children,
}: PropsWithChildren) {
  const router = useRouter();
  const { ready, authenticated, actorType } = useAuth();

  useEffect(() => {
    if (!ready || !authenticated) return;

    if (authenticated && actorType !== 'SUPER_ADMIN') {
      router.replace('/unauthorized'); // or /logout
      return;
    }
    // 🔁 Replace route only once
    router.replace('/dashboard');
  }, [ready, authenticated, router]);

  // Show loading until auth state is ready
  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading…
      </div>
    );
  }

  // Authenticated users should never see login pages
  if (authenticated) return null;

  // Guest users see the content
  return <>{children}</>;
}
