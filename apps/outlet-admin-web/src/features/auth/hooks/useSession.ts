'use client';

import { useEffect, useState } from 'react';
import { outletAuthService } from '../services/auth.service';
import { useRouter } from 'next/navigation';

export function useSessionGuard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    outletAuthService.getSession()
      .then((session) => {
        if (!session) {
          router.replace('/auth/login');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return { loading };
}
