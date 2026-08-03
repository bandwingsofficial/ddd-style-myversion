interface CheckoutErrorView {
  title: string;
  message: string;
}

function extractErrorPayload(error: unknown): {
  code?: string;
  message?: string;
  isNetwork: boolean;
} {
  const err = error as {
    message?: string;
    code?: string;
    response?: {
      data?: { code?: string; message?: string };
      status?: number;
    };
  };

  const isNetwork =
    !err?.response &&
    (err?.message === "Network Error" ||
      err?.code === "ECONNABORTED" ||
      err?.code === "ERR_NETWORK");

  return {
    code: err?.response?.data?.code ?? err?.code,
    message: err?.response?.data?.message ?? err?.message,
    isNetwork,
  };
}

export function mapCheckoutSummaryError(error: unknown): CheckoutErrorView {
  const { code, message, isNetwork } = extractErrorPayload(error);

  if (isNetwork) {
    return {
      title: "Connection problem",
      message:
        "Unable to connect right now. Please check your internet connection and try again.",
    };
  }

  switch (code) {
    case "ADDRESS_OUT_OF_SERVICE":
      return {
        title: "Delivery not available",
        message:
          "Sorry, we don't currently deliver to this address. Please choose another location.",
      };
    case "ADDRESS_OUTLET_MISMATCH":
      return {
        title: "Address outside delivery area",
        message:
          message ??
          "This address is outside the delivery area of your selected outlet.",
      };
    case "LOCATION_NOT_SERVICEABLE":
      return {
        title: "Delivery not available",
        message:
          "This outlet doesn't currently deliver to your selected address. Please choose another delivery location.",
      };
    case "EMPTY_CART":
    case "CART_OUTLET_MISMATCH":
    case "OUTLET_CART_MISMATCH":
    case "OUTLET_ORDER_MISMATCH":
      return {
        title: "Cart updated",
        message:
          "Your cart belongs to another outlet. Please review your cart before continuing.",
      };
    case "OUTLET_ID_REQUIRED":
    case "OUTLET_MISMATCH":
      return {
        title: "Outlet required",
        message: "Please select a delivery location first.",
      };
    case "ADDRESS_ID_REQUIRED":
    case "ADDRESS_NOT_FOUND":
      return {
        title: "Address required",
        message: "Please select a valid delivery address to continue.",
      };
    case "CART_ITEMS_REMOVED":
      return {
        title: "Cart updated",
        message:
          message ??
          "Some items were removed from your cart. Please review your cart before checkout.",
      };
    default:
      return {
        title: "Checkout unavailable",
        message:
          message && !message.toLowerCase().includes("internal")
            ? message
            : "We couldn't prepare your checkout right now. Please try again in a moment.",
      };
  }
}
