import { CheckoutStartResponse } from "./checkout.types";
import { savePaymentSession } from "./payment-session.util";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface OpenRazorpayParams {
  checkoutData: CheckoutStartResponse;
  addressId?: string;
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
  onFailed?: () => void;
}

export function openRazorpayCheckout(params: OpenRazorpayParams): () => void {
  const { checkoutData, addressId, onSuccess, onDismiss, onFailed } = params;

  if (typeof window.Razorpay === "undefined") {
    throw new Error("Payment gateway is still loading");
  }

  savePaymentSession({
    orderId: checkoutData.orderId,
    orderNumber: checkoutData.orderNumber,
    paymentId: checkoutData.paymentId,
    addressId,
    amount: String(checkoutData.grandTotal),
    startedAt: Date.now(),
  });

  const razorpayKey =
    checkoutData.key ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  const razorpayLogo =
    typeof window !== "undefined"
      ? `${window.location.origin}/images/Canten1.png`
      : undefined;

  const options = {
    key: razorpayKey,
    amount: checkoutData.razorpayAmount,
    currency: checkoutData.currency,
    name: "CANTEN",
    description: "Fresh Sugarcane Juice",
    image: razorpayLogo,
    order_id: checkoutData.razorpayOrderId,
    handler: onSuccess,
    prefill: {
      name: checkoutData.customerName,
      email: checkoutData.customerEmail || undefined,
      contact: checkoutData.customerPhone,
    },
    theme: { color: "#059669" },
    modal: {
      ondismiss: onDismiss,
    },
  };

  const rzp = new window.Razorpay(options);

  rzp.on("payment.failed", () => {
    onFailed?.();
  });

  rzp.open();

  return () => {
    try {
      rzp.close();
    } catch {
      // ignore
    }
  };
}
