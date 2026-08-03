import { fetchSession } from "@/features/customer-auth/api/session.api";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { useCartStore } from "@/features/cart/cart.store";
import { invalidateProductCatalogCache } from "@/features/products/api/product.api";

function devLog(event: string, payload: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[auth-sync]", { event, ...payload });
}

/**
 * Called after OTP verify succeeds (cookies already set by backend).
 */
export async function syncAfterLogin(): Promise<void> {
  const store = useCustomerAuthStore.getState();

  try {
    const res = await fetchSession();
    store.setSession(res.data.data);
    devLog("login_session_verified", {
      actorId: res.data.data?.actorId,
      sessionId: res.data.data?.sessionId,
    });
  } catch (error) {
    store.clearSession();
    devLog("login_session_failed", { error: String(error) });
    throw error;
  } finally {
    store.markSessionChecked();
  }

  invalidateProductCatalogCache();
  await useCartStore.getState().loadCart(true);
  devLog("login_cart_synced", {
    itemCount: useCartStore.getState().items.length,
  });
}

/**
 * Restore session on app boot (HttpOnly cookie).
 */
export async function syncSessionOnBoot(): Promise<void> {
  const store = useCustomerAuthStore.getState();

  try {
    const res = await fetchSession();
    store.setSession(res.data.data);
    devLog("boot_session_restored", {
      actorId: res.data.data?.actorId,
      sessionId: res.data.data?.sessionId,
    });
  } catch {
    store.clearSession();
    devLog("boot_session_absent", {});
  } finally {
    store.markSessionChecked();
  }
}

/**
 * Clear authenticated client state after logout or invalid session.
 */
export function syncAfterLogout(): void {
  useCustomerAuthStore.getState().clearSession();
  useCustomerAuthStore.getState().markSessionChecked();
  invalidateProductCatalogCache();
  useCartStore.getState().resetToGuest();
  devLog("logout_client_cleared", {});
}

export function handleAuthInvalidated(): void {
  const wasAuthenticated = useCustomerAuthStore.getState().isAuthenticated;
  if (!wasAuthenticated) return;

  syncAfterLogout();
  devLog("auth_invalidated", {});
}
