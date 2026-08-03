import { useCartStore } from "@/features/cart/cart.store";
import { useOutletStore } from "@/features/outlet/outlet.store";

export interface CheckoutOutletResolution {
  outletId: string | null;
  outletName: string | null;
  error?: string;
}

/**
 * At checkout, cart.outletId is the single source of truth for which outlet
 * the customer is ordering from. selectedOutlet should match but cart wins.
 */
export function resolveCheckoutOutletId(): CheckoutOutletResolution {
  const { selectedOutlet } = useOutletStore.getState();
  const { items, cartOutletId } = useCartStore.getState();

  const outletId = cartOutletId ?? selectedOutlet?.id ?? null;
  const outletName = selectedOutlet?.name ?? null;

  traceOutletBinding({
    stage: "checkout.resolveOutlet",
    selectedOutletId: selectedOutlet?.id ?? null,
    cartOutletId,
    itemOutletId: items[0]?.outletId ?? null,
    resolvedOutletId: outletId,
  });

  if (!outletId) {
    return {
      outletId: null,
      outletName: null,
      error: "No delivery outlet available for your cart.",
    };
  }

  if (cartOutletId && selectedOutlet?.id && cartOutletId !== selectedOutlet.id) {
    return {
      outletId: null,
      outletName: null,
      error:
        "Your cart belongs to a different outlet than your selected location. Please review your cart.",
    };
  }

  if (cartOutletId && cartOutletId !== outletId) {
    return {
      outletId: null,
      outletName: null,
      error:
        "Your cart belongs to another outlet. Please review your cart before continuing.",
    };
  }

  const mismatchedItem = items.find(
    (item) => item.outletId && item.outletId !== outletId,
  );
  if (mismatchedItem) {
    return {
      outletId: null,
      outletName: null,
      error:
        "Your cart belongs to another outlet. Please review your cart before continuing.",
    };
  }

  return { outletId, outletName };
}

export function traceOutletBinding(values: {
  stage: string;
  selectedOutletId?: string | null;
  cartOutletId?: string | null;
  checkoutOutletId?: string | null;
  paymentOutletId?: string | null;
  orderOutletId?: string | null;
  itemOutletId?: string | null;
  resolvedOutletId?: string | null;
}): void {
  if (process.env.NODE_ENV === "production") return;
  console.info("[outlet-trace]", {
    ...values,
    at: new Date().toISOString(),
  });
}
