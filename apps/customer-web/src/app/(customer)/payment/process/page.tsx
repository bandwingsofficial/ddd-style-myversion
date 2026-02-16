"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function PaymentProcessor() {
  const router = useRouter();
  const params = useSearchParams();
  
  // Params from Checkout Page (Razorpay + Internal)
  const orderId = params.get("orderId");
  const orderNumber = params.get("orderNumber"); // ✅ NEW
  const paymentId = params.get("paymentId");
  const rzpPaymentId = params.get("rzp_payment_id");
  const rzpOrderId = params.get("rzp_order_id");
  const rzpSignature = params.get("rzp_signature");

  const [status, setStatus] = useState<"PROCESSING" | "SUCCESS" | "FAILED">("PROCESSING");

  useEffect(() => {
    if (!paymentId || !orderId || !rzpPaymentId || !rzpSignature) {
      console.error("Missing payment parameters");
      setStatus("FAILED");
      return;
    }

    verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyPayment = async () => {
    try {
      await CheckoutApi.confirmPayment({
        orderId: orderId!,
        paymentId: paymentId!,
        razorpayPaymentId: rzpPaymentId!,
        razorpayOrderId: rzpOrderId!,
        razorpaySignature: rzpSignature!
      });

      setStatus("SUCCESS");
      
      setTimeout(() => {
        router.replace(`/orders/${orderId}`);
      }, 2000);

    } catch (error) {
      console.error("Payment Verification Failed", error);
      setStatus("FAILED");
    }
  };

  return (
    <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl text-center">
      
      {status === "PROCESSING" && (
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifying Payment</h2>
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
            Redirecting to your order receipt...
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
            We could not verify the payment. Please check your order status.
          </p>

          <button 
            onClick={() => router.replace(`/orders/${orderId}`)}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold"
          >
            Check Order
          </button>
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
