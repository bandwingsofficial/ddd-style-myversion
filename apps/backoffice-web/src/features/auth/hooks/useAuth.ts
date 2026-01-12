import { useAuthContext } from '../context/AuthProvider';

/**
 * useAuth
 *
 * Read-only hook for auth state
 * Used by:
 * - layouts
 * - guards (layout-based)
 * - components
 *
 * GUARANTEES:
 * - No side effects
 * - No API calls
 * - No redirects
 */
export function useAuth() {
  const ctx = useAuthContext();

  return {
    ready: ctx.ready,
    authenticated: ctx.authenticated,
    actorType: ctx.actorType,
    actorId: ctx.actorId,
    sessionId: ctx.sessionId,
  };
}
