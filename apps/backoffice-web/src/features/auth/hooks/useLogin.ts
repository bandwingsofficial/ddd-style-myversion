import { useState, useCallback } from 'react';
import { authService } from '../services/auth.service';
import {
  LoginRequest,
  LoginResponse,
} from '../types/auth.types';
import { ApiError, parseApiError } from '@/http';

/**
 * useLogin
 *
 * STEP 1:
 * Email + Password → MFA challenge
 *
 * CONTRACT:
 * - Never throws
 * - Returns null on failure
 * - Does NOT redirect
 * - Does NOT set auth state
 */
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<ApiError | null>(null);

  const login = useCallback(
    async (
      payload: LoginRequest,
    ): Promise<LoginResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await authService.login(payload);

        // Expected: { challengeId }
        return data;
      } catch (err) {
        const apiError = parseApiError(err);
        setError(apiError);

        // ✅ Never throw
        return null;
      } finally {
        // 🔑 Safe even if component unmounts later
        setLoading(false);
      }
    },
    [],
  );

  return {
    login,
    loading,
    error,
  };
}
