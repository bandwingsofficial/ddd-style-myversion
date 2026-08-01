"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { CheckoutSummary, CheckoutErrorResponse, CheckoutStartResponse } from "@/features/checkout/checkout.types";
import { useCartStore } from "@/features/cart/cart.store";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { ArrowLeft, ShieldCheck, Loader2, MapPin, ShoppingCart } from "lucide-react";
import Header from "@/components/customer/Header";
import { OrderSummaryBreakdown } from "@/features/orders/components/OrderSummaryBreakdown";
import { getProductImageUrl } from "@/lib/image-url";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addressId = searchParams.get("addressId");

  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const [pendingOrderModal, setPendingOrderModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
    orderNumber: string | null;
  }>({
    isOpen: false,
    orderId: null,
    orderNumber: null,
  });

  const { isAuthenticated, isHydrated: authHydrated } = useCustomerAuthStore();
  const { items: cartItems, loadCart, hydrated: cartHydrated } = useCartStore();
  const { selectedOutlet } = useOutletStore();

  useEffect(() => {
    const initCart = async () => {
      if (!authHydrated || !cartHydrated) return;

      if (!isAuthenticated) {
        router.replace("/login?redirect=/cart/checkout");
        return;
      }
      if (!addressId) {
        router.replace("/cart");
        return;
      }
      if (cartItems.length === 0) {
        await loadCart(true);
      }
      setInitializing(false);
    };
    void initCart();
  }, [authHydrated, cartHydrated, isAuthenticated, addressId, loadCart, router, cartItems.length]);

  useEffect(() => {
    if (initializing) return;

    const currentOutletId = cartItems[0]?.outletId || selectedOutlet?.id;

    if (!currentOutletId) {
      if (!loading && cartItems.length === 0) {
        router.replace("/home");
      }
      return;
    }

    void loadSummary(addressId!, currentOutletId);
  }, [initializing]);

  const loadSummary = async (addrId: string, outId: string) => {
    try {
      setLoading(true);
      const data = await CheckoutApi.getSummary(addrId, outId);
      setSummary(data);
    } catch (error) {
      console.error("Summary Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    const currentOutletId =
      useCartStore.getState().items[0]?.outletId ||
      useOutletStore.getState().selectedOutlet?.id;

    if (!addressId || !summary || !currentOutletId || processing || checkoutOpen) {
      return;
    }

    setProcessing(true);
    let checkoutData: CheckoutStartResponse | null = null;

    try {
      if (typeof window.Razorpay === "undefined") {
        toast.error(
          "Payment gateway is still loading. Please wait a moment and try again.",
        );
        return;
      }

      checkoutData = await CheckoutApi.startCheckout({
        savedAddressId: addressId,
        outletId: currentOutletId,
      });
    } catch (error: any) {
      const errData = error.response?.data as CheckoutErrorResponse;

      if (
        errData?.code === "ORDER_ALREADY_IN_PROGRESS" &&
        errData?.metadata?.orderId
      ) {
        setPendingOrderModal({
          isOpen: true,
          orderId: errData.metadata.orderId,
          orderNumber: errData.metadata.orderNumber || null,
        });
        return;
      }

      console.error("Checkout Error:", error);
      toast.error(errData?.message || "Could not initiate payment.");
      return;
    } finally {
      setProcessing(false);
    }

    if (!checkoutData) {
      return;
    }

    const data = checkoutData;
    const razorpayKey = data.key ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    console.log("[Razorpay Checkout]", {
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      checkoutId: data.checkoutId,
      subtotal: data.subtotal,
      discount: data.discount,
      deliveryFee: data.deliveryFee,
      grandTotal: data.grandTotal,
      razorpayAmount: data.razorpayAmount,
      isRetry: data.isRetry,
    });

    const closeCheckout = () => {
      setCheckoutOpen(false);
    };

    const razorpayLogo =
      typeof window !== "undefined"
        ? `${window.location.origin}/images/Canten1.png`
        : undefined;

    const options = {
      key: razorpayKey,
      amount: data.razorpayAmount,
      currency: data.currency,
      name: "CANTEN",
      description: "Fresh Sugarcane Juice",
      image: razorpayLogo,
      order_id: data.razorpayOrderId,
      handler: function (response: any) {
        closeCheckout();
        const params = new URLSearchParams({
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          paymentId: data.paymentId,
          rzp_payment_id: response.razorpay_payment_id,
          rzp_order_id: response.razorpay_order_id,
          rzp_signature: response.razorpay_signature,
          amount: data.grandTotal.toString(),
          addressId: addressId,
        });

        router.replace(`/payment/process?${params.toString()}`);
      },
      prefill: {
        name: data.customerName,
        email: data.customerEmail || undefined,
        contact: data.customerPhone,
      },
      theme: { color: "#10B981" },
      modal: {
        ondismiss: function () {
          closeCheckout();
          toast.message("Payment cancelled. You can retry when ready.");
        },
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response: any) {
      console.error("[Razorpay] Payment failed:", response);
      closeCheckout();
      toast.error(
        response?.error?.description ||
          "Payment failed. Please try again.",
      );
    });

    setCheckoutOpen(true);
    try {
      rzp.open();
    } catch (openError) {
      console.error("[Razorpay] Failed to open checkout:", openError);
      closeCheckout();
      toast.error("Could not open payment window. Please try again.");
    }
  };

  if (initializing || loading || !summary) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
        <p className="text-slate-500 font-medium">
          {initializing ? "Syncing data..." : "Preparing your checkout..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Header />

      {pendingOrderModal.isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-6 max-w-[340px] w-full shadow-2xl text-center animate-in fade-in zoom-in duration-200">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Order in Progress</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-4 px-1">
                You already have an order being fulfilled.
                {pendingOrderModal.orderNumber && (
                  <span className="block mt-2 font-bold text-emerald-600 uppercase">
                    Order: #{pendingOrderModal.orderNumber}
                  </span>
                )}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/orders/${pendingOrderModal.orderId}`)}
                  className="w-full bg-[#059669] hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl"
                >
                  View Order
                </button>

                <button
                  onClick={() =>
                    setPendingOrderModal({ isOpen: false, orderId: null, orderNumber: null })
                  }
                  className="w-full bg-[#F1F5F9] hover:bg-slate-200 text-[#0F172A] font-semibold py-3.5 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <main className="customer-page-shell customer-page-shell--no-nav mobile-container max-w-5xl pb-28 lg:pb-12">
        <button
          onClick={() => router.back()}
          className="flex items-center text-slate-500 hover:text-emerald-600 mb-6 font-medium"
        >
          <ArrowLeft size={18} className="mr-2" /> Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">Review & Pay</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs mb-1">
                    Delivery Address
                  </h3>
                  <p className="font-bold text-lg text-slate-800">{summary.address.label}</p>
                  <p className="text-slate-500 leading-relaxed">{summary.address.addressText}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-700">
                Items ({summary.itemCount})
              </div>
              <div className="divide-y divide-slate-100">
                {summary.items.map((item) => {
                  const imageUrl = getProductImageUrl(item.productImage);
                  return (
                    <div key={item.productId} className="p-4 flex gap-4">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.productName}
                          className="w-16 h-16 rounded-lg object-cover bg-slate-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                          <ShoppingCart size={20} className="text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-bold text-slate-800">{item.productName}</h4>
                          <span className="font-bold text-slate-900">₹{item.lineTotal}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {item.quantity} x ₹{item.discountPrice || item.unitPrice}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-32">
              <h3 className="font-bold text-slate-900 mb-4">Bill Details</h3>

              <OrderSummaryBreakdown
                subtotal={summary.subtotal}
                discount={summary.discount}
                netSubtotal={summary.netSubtotal ?? summary.afterDiscountTotal}
                deliveryFee={summary.deliveryFee}
                grandTotal={summary.grandTotal}
                remainingForFreeDelivery={summary.remainingForFreeDelivery ?? summary.remainingAmountForFreeDelivery}
                totalLabel="Total Payable"
                className="space-y-3 text-sm text-slate-600 pb-4 border-b border-slate-100"
                totalClassName="flex justify-between items-center py-4 font-extrabold text-xl text-slate-900"
              />

              <button
                onClick={handlePay}
                disabled={processing || checkoutOpen}
                className="hidden w-full items-center justify-center gap-2 rounded-xl bg-[#059669] py-4 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 lg:flex touch-target"
              >
                {processing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ShieldCheck />
                )}
                {processing
                  ? "Processing..."
                  : checkoutOpen
                    ? "Payment Window Open"
                    : `Pay ₹${summary.grandTotal}`}
              </button>
            </div>
          </div>
        </div>
      </main>

      <div
        className="fixed inset-x-0 z-[800] border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-lg lg:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Payable
            </p>
            <p className="text-xl font-extrabold text-slate-900">₹{summary.grandTotal}</p>
          </div>
          <button
            type="button"
            onClick={handlePay}
            disabled={processing || checkoutOpen}
            className="flex min-h-[2.75rem] flex-1 max-w-[220px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-70 touch-target"
          >
            {processing ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <ShieldCheck size={18} />
            )}
            {processing ? "Processing..." : `Pay ₹${summary.grandTotal}`}
          </button>
        </div>
      </div>
    </div>
  );
}
