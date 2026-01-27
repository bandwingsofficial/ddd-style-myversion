"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function PaymentProcessor() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const paymentId = params.get("paymentId");
  const amount = params.get("amount");

  const [status, setStatus] = useState<"PROCESSING" | "SUCCESS" | "FAILED">("PROCESSING");

  useEffect(() => {
    if (!paymentId || !orderId) {
      setStatus("FAILED");
      return;
    }

    // Simulate Network Delay like a real gateway
    const timer = setTimeout(() => {
      confirmPayment();
    }, 2000);

    return () => clearTimeout(timer);
  }, [paymentId, orderId]);

  const confirmPayment = async () => {
    try {
      await CheckoutApi.confirmPayment(paymentId!);
      setStatus("SUCCESS");
      
      // Redirect to Order Receipt after 1.5 seconds
      setTimeout(() => {
        router.replace(`/orders/${orderId}`);
      }, 1500);
    } catch (error) {
      console.error("Payment Confirmation Failed", error);
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
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Processing Payment</h2>
          <p className="text-slate-500">Please wait while we secure your payment of ₹{amount}...</p>
        </div>
      )}

      {status === "SUCCESS" && (
        <div className="animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
          <p className="text-slate-500">Redirecting to your order...</p>
        </div>
      )}

      {status === "FAILED" && (
        <div className="animate-in shake duration-300">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Failed</h2>
          <p className="text-slate-500 mb-6">Something went wrong with the transaction.</p>
          <button 
            onClick={() => router.back()}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold"
          >
            Try Again
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