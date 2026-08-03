import type { Address } from "@/features/addresses/address.types";
import { traceOutletBinding } from "@/features/checkout/resolve-checkout-outlet.util";

export type AddressCheckoutValidation =
  | { status: "ok"; checkoutOutletId: string }
  | {
      status: "not_serviceable";
      message: string;
    }
  | {
      status: "outlet_mismatch";
      cartOutletId: string;
      cartOutletName: string;
      addressOutletId: string;
      addressOutletName: string;
      message: string;
    };

/**
 * Checkout validity depends ONLY on delivery address vs cart outlet.
 * GPS / browser location must never influence this check.
 */
export function validateAddressForCheckout(params: {
  address: Address;
  cartOutletId: string | null;
  cartOutletName: string | null;
}): AddressCheckoutValidation {
  const checkoutOutletId = params.cartOutletId;

  traceOutletBinding({
    stage: "checkout.validateAddress",
    cartOutletId: checkoutOutletId,
    resolvedOutletId: params.address.resolvedOutletId ?? null,
  });

  if (!params.address.serviceable || !params.address.resolvedOutletId) {
    return {
      status: "not_serviceable",
      message:
        "Sorry, we don't currently deliver to this address. Please choose another location.",
    };
  }

  if (!checkoutOutletId) {
    return {
      status: "not_serviceable",
      message:
        "No delivery outlet is selected for your cart. Please choose a delivery location first.",
    };
  }

  if (params.address.resolvedOutletId !== checkoutOutletId) {
    const addressOutletName =
      params.address.resolvedOutletName ?? "another outlet";
    const cartOutletName = params.cartOutletName ?? "your current outlet";

    return {
      status: "outlet_mismatch",
      cartOutletId: checkoutOutletId,
      cartOutletName,
      addressOutletId: params.address.resolvedOutletId,
      addressOutletName,
      message: `This address is outside the delivery area of your selected outlet. Available delivery outlet: ${addressOutletName}. Your cart is from: ${cartOutletName}.`,
    };
  }

  return { status: "ok", checkoutOutletId };
}
