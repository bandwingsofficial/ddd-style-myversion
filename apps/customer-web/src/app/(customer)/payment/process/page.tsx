"use client";

import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { OrderDetails } from "@/features/checkout/checkout.types";
import { useCartStore } from "@/features/cart/cart.store";
import { useOutletStore } from "@/features/outlet/outlet.store";
import {
  clearPaymentSession,
  getPaymentSession,
  isPaymentVerified,
  markPaymentVerified,
  savePaymentSession,
} from "@/features/checkout/payment-session.util";
import { Loader2, CheckCircle, XCircle, ShoppingBag, ListOrdered } from "lucide-react";
import SupportCard, {
  EstimatedPrepTime,
} from "@/features/orders/components/SupportCard";

const PAID_ORDER_STATUSES = new Set([
  "PAID",
  "CONFIRMED",
  "PREPARING",
  "READY_TO_DISPATCH",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
]);

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 12;

function PaymentProcessor() {
  const router = useRouter();
  const params = useSearchParams();
  const verificationStarted = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const orderId = params.get("orderId");
  const orderNumber = params.get("orderNumber");
  const paymentId = params.get("paymentId");
  const addressId = params.get("addressId");
  const amount = params.get("amount");
  const failedParam = params.get("failed") === "true";
  const rzpPaymentId = params.get("rzp_payment_id");
  const rzpOrderId = params.get("rzp_order_id");
  const rzpSignature = params.get("rzp_signature");

  const [status, setStatus] = useState<"PROCESSING" | "SUCCESS" | "FAILED">(
    failedParam ? "FAILED" : "PROCESSING",
  );
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Verifying your payment...",
  );

  const selectedOutlet = useOutletStore((state) => state.selectedOutlet);
  const cartOutletName = useCartStore((state) => state.cartOutletName);

  const refreshCartAfterSuccess = useCallback(async () => {
    await useCartStore.getState().loadCart(true);
  }, []);

  const finalizeSuccess = useCallback(
    async (order?: OrderDetails) => {
      if (order) {
        setOrderDetails(order);
      }
      if (orderId) {
        markPaymentVerified(orderId);
      }
      clearPaymentSession();
      await refreshCartAfterSuccess();
      setStatus("SUCCESS");
      setStatusMessage("Payment verified successfully.");
    },
    [orderId, refreshCartAfterSuccess],
  );

  const tryRecoverPaidOrder = useCallback(async (): Promise<boolean> => {
    if (!orderId) {
      return false;
    }

    if (isPaymentVerified(orderId)) {
      try {
        const order = await CheckoutApi.getOrder(orderId);
        await finalizeSuccess(order);
        return true;
      } catch {
        setStatus("SUCCESS");
        return true;
      }
    }

    try {
      const order = await CheckoutApi.getOrder(orderId);
      if (PAID_ORDER_STATUSES.has(order.status.toUpperCase())) {
        await finalizeSuccess(order);
        return true;
      }
    } catch (recoveryError) {
      console.error("Order recovery check failed:", recoveryError);
    }

    return false;
  }, [finalizeSuccess, orderId]);

  const schedulePoll = useCallback(
    (attempt: number) => {
      if (attempt > MAX_POLL_ATTEMPTS) {
        setStatus("FAILED");
        setStatusMessage(
          "We could not confirm your payment yet. You can retry or check order status.",
        );
        return;
      }

      pollTimerRef.current = setTimeout(async () => {
        const recovered = await tryRecoverPaidOrder();
        if (recovered) {
          return;
        }
        schedulePoll(attempt + 1);
      }, POLL_INTERVAL_MS);
    },
    [tryRecoverPaidOrder],
  );

  const verifyPayment = useCallback(async () => {
    if (!paymentId || !orderId || !rzpPaymentId || !rzpSignature || !rzpOrderId) {
      const recovered = await tryRecoverPaidOrder();
      if (!recovered) {
        setStatus("FAILED");
        setStatusMessage("Payment details were incomplete. Please retry or check your order.");
      }
      return;
    }

    if (isPaymentVerified(orderId)) {
      await tryRecoverPaidOrder();
      return;
    }

    setStatusMessage("Verifying your payment...");

    try {
      const result = await CheckoutApi.confirmPayment({
        orderId,
        paymentId,
        razorpayPaymentId: rzpPaymentId,
        razorpayOrderId: rzpOrderId,
        razorpaySignature: rzpSignature,
      });

      if (result.status !== "SUCCESS") {
        throw new Error("Payment not successful");
      }

      const order = await CheckoutApi.getOrder(orderId);
      await finalizeSuccess(order);
    } catch (error) {
      console.error("Payment Verification Failed", error);
      setStatusMessage("Still verifying with our servers...");
      const recovered = await tryRecoverPaidOrder();
      if (!recovered) {
        schedulePoll(1);
      }
    }
  }, [
    finalizeSuccess,
    orderId,
    paymentId,
    rzpOrderId,
    rzpPaymentId,
    rzpSignature,
    schedulePoll,
    tryRecoverPaidOrder,
  ]);

  useEffect(() => {
    if (failedParam) {
      return;
    }

    if (orderId && paymentId) {
      savePaymentSession({
        orderId,
        orderNumber: orderNumber ?? "",
        paymentId,
        addressId: addressId ?? undefined,
        amount: amount ?? undefined,
        startedAt: Date.now(),
      });
    }

    if (verificationStarted.current) {
      return;
    }
    verificationStarted.current = true;

    void verifyPayment();

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [
    addressId,
    amount,
    failedParam,
    orderId,
    orderNumber,
    paymentId,
    verifyPayment,
  ]);

  useEffect(() => {
    if (status !== "PROCESSING") {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [status]);

  const retryCheckout = () => {
    const session = getPaymentSession();
    const resolvedAddressId = addressId ?? session?.addressId;
    if (resolvedAddressId) {
      router.replace(`/cart/checkout?addressId=${resolvedAddressId}`);
      return;
    }
    router.replace("/cart");
  };

  const displayOrderNumber =
    orderDetails?.orderNumber ?? orderNumber ?? undefined;
  const displayAmount =
    orderDetails?.grandTotal ?? (amount ? Number(amount) : undefined);
  const outletName =
    orderDetails?.outletName ?? cartOutletName ?? selectedOutlet?.name;

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        {status === "PROCESSING" && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">
              Processing Payment
            </h2>
            <p className="text-slate-500">{statusMessage}</p>
            <p className="mt-3 text-xs text-slate-400">
              Please do not close this window...
            </p>
            {displayOrderNumber && (
              <p className="mt-4 text-sm font-semibold text-slate-600">
                Order #{displayOrderNumber}
              </p>
            )}
          </div>
        )}

        {status === "SUCCESS" && (
          <div className="animate-in zoom-in space-y-5 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-emerald-900">
                Payment Successful
              </h2>
              <p className="mt-1 text-sm text-emerald-700">Order Confirmed</p>
            </div>

            <div className="space-y-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm">
              {displayOrderNumber && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Order Number</span>
                  <span className="font-bold text-slate-800">#{displayOrderNumber}</span>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Payment Status</span>
                <span className="font-bold text-emerald-700">Paid</span>
              </div>
              {displayAmount != null && !Number.isNaN(displayAmount) && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-bold text-slate-800">₹{displayAmount}</span>
                </div>
              )}
              {outletName && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Outlet</span>
                  <span className="truncate font-bold text-slate-800">{outletName}</span>
                </div>
              )}
            </div>

            <EstimatedPrepTime className="text-left" />

            <div className="flex flex-col gap-3 pt-2">
              <Link
                href={orderId ? `/orders/${orderId}` : "/orders"}
                className="touch-target inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-bold text-white hover:bg-emerald-700"
              >
                <ListOrdered size={18} />
                View Orders
              </Link>
              <Link
                href="/home"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 font-semibold text-slate-800"
              >
                <ShoppingBag size={18} />
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {status === "FAILED" && (
          <div className="animate-in shake space-y-5 duration-300 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Payment Failed</h2>
            {displayOrderNumber && (
              <p className="text-sm font-semibold text-slate-600">
                Order #{displayOrderNumber}
              </p>
            )}
            <p className="text-slate-500">
              {statusMessage ||
                "Your payment could not be completed. You can retry safely without creating a duplicate order."}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={retryCheckout}
                className="touch-target rounded-xl bg-emerald-600 px-6 py-3.5 font-bold text-white hover:bg-emerald-700"
              >
                Retry Payment
              </button>
              <button
                onClick={() => router.replace("/cart")}
                className="rounded-xl bg-slate-100 px-6 py-3 font-semibold text-slate-800"
              >
                Return To Checkout
              </button>
              {orderId && (
                <button
                  onClick={() => router.replace(`/orders/${orderId}`)}
                  className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700"
                >
                  Check Order Status
                </button>
              )}
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
    <div
      className="flex min-h-[100dvh] items-center justify-center bg-slate-50 p-4"
      style={{
        paddingTop: "calc(1rem + env(safe-area-inset-top))",
        paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
      }}
    >
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3 text-emerald-600">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="text-sm font-medium text-slate-600">Loading payment status...</p>
          </div>
        }
      >
        <PaymentProcessor />
      </Suspense>
    </div>
  );
}
