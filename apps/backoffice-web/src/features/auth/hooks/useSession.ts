import { useCallback } from 'react';
import { sessionService } from '../services/session.service';
import { useAuthContext } from '../context/AuthProvider';

/**
 * useSession
 *
 * SINGLE source of truth for session hydration
 *
 * CONTRACT:
 * - Returns boolean (success / failure)
 * - ALWAYS resolves auth state (ready = true)
 * - NEVER throws
 */
export function useSession() {
  const { setAuthenticated, reset } = useAuthContext();

  const fetchSession = useCallback(async (): Promise<boolean> => {
    try {
      const session = await sessionService.me();

      /**
       * Successful session hydration
       */
      setAuthenticated({
        authenticated: true,
        actorType: session.actorType,
        actorId: session.actorId,
        sessionId: session.sessionId,
      });

      return true;
    } catch {
      /**
       * Any failure means "guest"
       * Auth state MUST still be finalized
       */
      reset(); // ready = true, authenticated = false
      return false;
    }
  }, [setAuthenticated, reset]);

  return { fetchSession };
}
