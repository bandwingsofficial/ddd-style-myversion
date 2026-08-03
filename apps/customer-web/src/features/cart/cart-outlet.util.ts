import { useCartStore } from "@/features/cart/cart.store";
import { useOutletStore } from "@/features/outlet/outlet.store";

/** Cart outlet id is immutable once items exist; falls back to selected outlet. */
export function getEffectiveCartOutletId(): string | null {
  const { cartOutletId } = useCartStore.getState();
  if (cartOutletId) return cartOutletId;
  return useOutletStore.getState().selectedOutlet?.id ?? null;
}

/** Prefer cart-bound outlet name; falls back to selected outlet name. */
export function getEffectiveCartOutletName(): string | null {
  const { cartOutletName } = useCartStore.getState();
  if (cartOutletName) return cartOutletName;
  return useOutletStore.getState().selectedOutlet?.name ?? null;
}
