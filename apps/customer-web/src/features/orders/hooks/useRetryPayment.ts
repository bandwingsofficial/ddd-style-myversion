"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CheckoutApi } from "@/features/checkout/checkout.api";
import { openRazorpayCheckout } from "@/features/checkout/razorpay.util";

export function useRetryPayment(orderId: string, onAfterDismiss?: () => void) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);

  const startPayment = useCallback(async () => {
    if (paying) return;
    setPaying(true);
    try {
      const checkoutData = await CheckoutApi.retryPayment(orderId);

      openRazorpayCheckout({
        checkoutData,
        onSuccess: (response) => {
          const params = new URLSearchParams({
            orderId: checkoutData.orderId,
            orderNumber: checkoutData.orderNumber,
            paymentId: checkoutData.paymentId,
            rzp_payment_id: response.razorpay_payment_id,
            rzp_order_id: response.razorpay_order_id,
            rzp_signature: response.razorpay_signature,
            amount: checkoutData.grandTotal.toString(),
          });
          router.push(`/payment/process?${params.toString()}`);
        },
        onDismiss: () => {
          toast.message("Payment cancelled. You can retry when ready.");
          onAfterDismiss?.();
        },
        onFailed: () => {
          toast.error("Payment failed. Please try again.");
          onAfterDismiss?.();
        },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not start payment.");
      onAfterDismiss?.();
    } finally {
      setPaying(false);
    }
  }, [orderId, paying, router, onAfterDismiss]);

  return { paying, startPayment };
}
