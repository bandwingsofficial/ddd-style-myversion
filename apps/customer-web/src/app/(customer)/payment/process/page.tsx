"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { useCartStore } from "@/features/cart/cart.store";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import SupportCard, {
  EstimatedPrepTime,
  PaymentSuccessBanner,
} from "@/features/orders/components/SupportCard";

const PAID_ORDER_STATUSES = new Set([
  "PAID",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
]);

function PaymentProcessor() {
  const router = useRouter();
  const params = useSearchParams();

  const orderId = params.get("orderId");
  const orderNumber = params.get("orderNumber");
  const paymentId = params.get("paymentId");
  const addressId = params.get("addressId");
  const rzpPaymentId = params.get("rzp_payment_id");
  const rzpOrderId = params.get("rzp_order_id");
  const rzpSignature = params.get("rzp_signature");

  const [status, setStatus] = useState<"PROCESSING" | "SUCCESS" | "FAILED">(
    "PROCESSING",
  );

  const refreshCartAfterSuccess = async () => {
    await useCartStore.getState().loadCart(true);
  };

  const redirectToOrder = () => {
    setTimeout(() => {
      router.replace(`/orders/${orderId}`);
    }, 3000);
  };

  const finalizeSuccess = async () => {
    await refreshCartAfterSuccess();
    setStatus("SUCCESS");
    redirectToOrder();
  };

  const tryRecoverPaidOrder = async (): Promise<boolean> => {
    if (!orderId) {
      return false;
    }

    try {
      const order = await CheckoutApi.getOrder(orderId);
      if (PAID_ORDER_STATUSES.has(order.status.toUpperCase())) {
        await finalizeSuccess();
        return true;
      }
    } catch (recoveryError) {
      console.error("Order recovery check failed:", recoveryError);
    }

    return false;
  };

  useEffect(() => {
    if (!paymentId || !orderId || !rzpPaymentId || !rzpSignature || !rzpOrderId) {
      void (async () => {
        const recovered = await tryRecoverPaidOrder();
        if (!recovered) {
          setStatus("FAILED");
        }
      })();
      return;
    }

    void verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyPayment = async () => {
    try {
      const result = await CheckoutApi.confirmPayment({
        orderId: orderId!,
        paymentId: paymentId!,
        razorpayPaymentId: rzpPaymentId!,
        razorpayOrderId: rzpOrderId!,
        razorpaySignature: rzpSignature!,
      });

      if (result.status !== "SUCCESS") {
        throw new Error("Payment not successful");
      }

      await finalizeSuccess();
    } catch (error) {
      console.error("Payment Verification Failed", error);
      const recovered = await tryRecoverPaidOrder();
      if (!recovered) {
        setStatus("FAILED");
      }
    }
  };

  const retryCheckout = () => {
    if (addressId) {
      router.replace(`/cart/checkout?addressId=${addressId}`);
      return;
    }
    router.replace("/cart");
  };

  const checkOrderStatus = async () => {
    const recovered = await tryRecoverPaidOrder();
    if (!recovered && orderId) {
      router.replace(`/orders/${orderId}`);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-xl text-center">
        {status === "PROCESSING" && (
          <div className="animate-pulse">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">
              Verifying Payment
            </h2>
            <p className="text-slate-500">
              Please do not close this window...
            </p>
          </div>
        )}

        {status === "SUCCESS" && (
          <div className="animate-in zoom-in space-y-5 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <PaymentSuccessBanner orderNumber={orderNumber ?? undefined} />
            <EstimatedPrepTime className="text-left" />
            <p className="text-slate-500">
              Redirecting to your order details...
            </p>
          </div>
        )}

        {status === "FAILED" && (
          <div className="animate-in shake space-y-5 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Payment Not Verified
            </h2>
            {orderNumber && (
              <p className="text-sm font-semibold text-slate-600">
                Order #{orderNumber}
              </p>
            )}
            <p className="text-slate-500">
              We could not verify the payment yet. You can retry or check your
              order status.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={retryCheckout}
                className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
              >
                Retry Payment
              </button>
              <button
                onClick={() => void checkOrderStatus()}
                className="rounded-xl bg-slate-100 px-6 py-3 font-semibold text-slate-800"
              >
                Check Order Status
              </button>
            </div>
          </div>
        )}
      </div>

      <SupportCard compact />
    </div>
  );
}

export default function PaymentProcessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={<Loader2 className="animate-spin" />}>
        <PaymentProcessor />
      </Suspense>
    </div>
  );
}
