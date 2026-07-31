"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { useCartStore } from "@/features/cart/cart.store";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

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
    }, 2000);
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
    <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl text-center">
      {status === "PROCESSING" && (
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Verifying Payment
          </h2>
          <p className="text-slate-500">Please do not close this window...</p>
        </div>
      )}

      {status === "SUCCESS" && (
        <div className="animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Payment Confirmed!
          </h2>
          {orderNumber && (
            <p className="text-sm font-semibold text-slate-600 mb-2">
              Order #{orderNumber}
            </p>
          )}
          <p className="text-slate-500">
            Your order is confirmed. Redirecting to your order receipt...
          </p>
        </div>
      )}

      {status === "FAILED" && (
        <div className="animate-in shake duration-300">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Verification Failed
          </h2>
          {orderNumber && (
            <p className="text-sm font-semibold text-slate-600 mb-2">
              Order #{orderNumber}
            </p>
          )}
          <p className="text-slate-500 mb-6">
            We could not verify the payment. Your cart is still saved — you can
            retry payment.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={retryCheckout}
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700"
            >
              Retry Payment
            </button>
            <button
              onClick={() => void checkOrderStatus()}
              className="bg-slate-100 text-slate-800 px-6 py-3 rounded-xl font-semibold"
            >
              Check Order Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentProcessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="animate-spin" />}>
        <PaymentProcessor />
      </Suspense>
    </div>
  );
}
