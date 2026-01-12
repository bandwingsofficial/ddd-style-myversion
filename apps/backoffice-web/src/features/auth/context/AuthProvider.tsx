'use client';

import {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
  useCallback,
} from 'react';

/**
 * Shape of auth context
 * (NO TOKENS, mirrors backend session)
 */
export interface AuthContextValue {
  ready: boolean;
  authenticated: boolean;
  actorType?: string;
  actorId?: string;
  sessionId?: string;

  // actions
  setAuthenticated: (data: {
    authenticated: boolean;
    actorType?: string;
    actorId?: string;
    sessionId?: string;
  }) => void;

  reset: () => void;
}

const AuthContext =
  createContext<AuthContextValue | null>(null);

/**
 * AuthProvider
 *
 * GUARANTEES:
 * - `ready` is always eventually `true`
 * - NO API calls
 * - NO redirects
 * - State container ONLY
 */
export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [state, setState] = useState<{
    ready: boolean;
    authenticated: boolean;
    actorType?: string;
    actorId?: string;
    sessionId?: string;
  }>({
    ready: false,
    authenticated: false,
  });

  /**
   * Mark user as authenticated or unauthenticated
   * (called by session bootstrapper)
   */
  const setAuthenticated = useCallback(
    (data: {
      authenticated: boolean;
      actorType?: string;
      actorId?: string;
      sessionId?: string;
    }) => {
      setState({
        ready: true,
        authenticated: data.authenticated,
        actorType: data.actorType,
        actorId: data.actorId,
        sessionId: data.sessionId,
      });
    },
    [],
  );

  /**
   * Reset auth state (logout / hard failure)
   * ⚠️ MUST ALSO SET ready = true
   */
  const reset = useCallback(() => {
    setState({
      ready: true,
      authenticated: false,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        setAuthenticated,
        reset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to consume auth context
 */
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      'useAuthContext must be used within AuthProvider',
    );
  }
  return ctx;
}
