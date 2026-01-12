import { useCallback } from 'react';
import { authService } from '../services/auth.service';
import { useAuthContext } from '../context/AuthProvider';

/**
 * useLogout
 *
 * Logs out the current session
 *
 * GUARANTEES:
 * - Backend logout is attempted
 * - Frontend auth state is ALWAYS cleared
 * - No refresh attempts
 * - No redirect loops
 */
export function useLogout() {
  const { reset } = useAuthContext();

  const logout = useCallback(async () => {
    try {
      /**
       * Backend:
       * - invalidates session
       * - clears cookies
       *
       * ⚠️ Must NOT trigger refresh
       */
      await authService.logout();
    } catch {
      /**
       * Ignore errors:
       * - already logged out
       * - expired session
       * - network failure
       */
    } finally {
      /**
       * Frontend must ALWAYS reset auth state
       * (even if backend call fails)
       */
      reset();
    }
  }, [reset]);

  return { logout };
}
