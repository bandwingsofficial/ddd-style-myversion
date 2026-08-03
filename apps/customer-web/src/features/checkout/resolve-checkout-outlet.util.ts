import { useCartStore } from "@/features/cart/cart.store";
import { useOutletStore } from "@/features/outlet/outlet.store";

export interface CheckoutOutletResolution {
  outletId: string | null;
  error?: string;
}

/** Checkout outlet is always the auto-resolved selectedOutlet. */
export function resolveCheckoutOutletId(): CheckoutOutletResolution {
  const { selectedOutlet } = useOutletStore.getState();
  const { items, cartOutletId } = useCartStore.getState();

  const outletId = selectedOutlet?.id ?? cartOutletId ?? null;

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
      error: "No delivery outlet available for your location.",
    };
  }

  if (cartOutletId && cartOutletId !== outletId) {
    return {
      outletId: null,
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
      error:
        "Your cart belongs to another outlet. Please review your cart before continuing.",
    };
  }

  return { outletId };
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
