import { useState, useCallback } from 'react';
import { authService } from '../services/auth.service';
import { useSession } from './useSession';
import { VerifyMfaRequest } from '../types/auth.types';
import { ApiError, parseApiError } from '@/http';

/**
 * useMfa
 *
 * STEP 2:
 * challengeId + code → authenticated session
 *
 * CONTRACT:
 * - Never throws
 * - Returns boolean success
 * - Fully hydrates auth state on success
 */
export function useMfa() {
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<ApiError | null>(null);

  const { fetchSession } = useSession();

  // 🔑 Allows browser to commit Set-Cookie headers
  const waitForCookieCommit = () =>
    new Promise((resolve) => setTimeout(resolve, 0));

  const verifyMfa = useCallback(
    async (
      payload: VerifyMfaRequest,
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        /**
         * Backend:
         * - verifies MFA
         * - sets accessToken + refreshToken cookies
         */
        await authService.verifyMfa(payload);

        /**
         * 🔥 CRITICAL FIX
         * Allow browser event loop to persist cookies
         * before session hydration
         */
        await waitForCookieCommit();

        /**
         * Hydrate auth context
         */
        const hydrated = await fetchSession();

        if (!hydrated) {
          throw new Error('SESSION_HYDRATION_FAILED');
        }

        return true;
      } catch (err) {
        const apiError = parseApiError(err);
        setError(apiError);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchSession],
  );

  return {
    verifyMfa,
    loading,
    error,
  };
}
