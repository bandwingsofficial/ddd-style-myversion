import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";

/**
 * Single source of truth for whether authenticated API calls are safe.
 * Never treat persisted/local isAuthenticated as valid until sessionChecked.
 */
export function useCustomerSession() {
  const isHydrated = useCustomerAuthStore((s) => s.isHydrated);
  const sessionChecked = useCustomerAuthStore((s) => s.sessionChecked);
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const actorId = useCustomerAuthStore((s) => s.actorId);
  const sessionId = useCustomerAuthStore((s) => s.sessionId);

  const isReady = isHydrated && sessionChecked;
  const isLoggedIn = isReady && isAuthenticated;

  return {
    isHydrated,
    sessionChecked,
    isReady,
    isAuthenticated,
    isLoggedIn,
    actorId,
    sessionId,
  };
}

export function getCustomerSessionSnapshot() {
  const state = useCustomerAuthStore.getState();
  const isReady = state.isHydrated && state.sessionChecked;
  return {
    ...state,
    isReady,
    isLoggedIn: isReady && state.isAuthenticated,
  };
}

export function canUseAuthenticatedApis(): boolean {
  const { isReady, isAuthenticated } = getCustomerSessionSnapshot();
  return isReady && isAuthenticated;
}
