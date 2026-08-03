"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import {
  CheckoutSummary,
  CheckoutErrorResponse,
  CheckoutStartResponse,
} from "@/features/checkout/checkout.types";
import { useCartStore } from "@/features/cart/cart.store";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { ArrowLeft, Loader2, MapPin, ShoppingCart } from "lucide-react";
import Header from "@/components/customer/Header";
import { OrderSummaryBreakdown } from "@/features/orders/components/OrderSummaryBreakdown";
import { getProductImageUrl } from "@/lib/image-url";
import { savePaymentSession } from "@/features/checkout/payment-session.util";
import { computeLineTotal } from "@/lib/cart-pricing";
import {
  resolveCheckoutOutletId,
  traceOutletBinding,
} from "@/features/checkout/resolve-checkout-outlet.util";
import { validateAddressForCheckout } from "@/features/checkout/validate-address-outlet.util";
import { mapCheckoutSummaryError } from "@/features/checkout/checkout-error.util";
import { CheckoutPaymentBar } from "@/components/checkout/CheckoutPaymentBar";
import { AddressService } from "@/features/addresses/address.service";
import { useLocationStore } from "@/features/location/location.store";
import { CheckoutOutOfServiceState } from "@/components/location/NoDeliveryState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { typography } from "@/lib/design-tokens";

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadErrorTitle, setLoadErrorTitle] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [outletResolutionError, setOutletResolutionError] = useState<
    string | null
  >(null);
  const [addressOutOfService, setAddressOutOfService] = useState(false);
  const [addressValidationMessage, setAddressValidationMessage] = useState<
    string | null
  >(null);
  const [syncingAddress, setSyncingAddress] = useState(true);

  const [pendingOrderModal, setPendingOrderModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
    orderNumber: string | null;
  }>({
    isOpen: false,
    orderId: null,
    orderNumber: null,
  });

  const { isLoggedIn, isHydrated: authHydrated } = useCustomerSession();
  const {
    items: cartItems,
    loadCart,
    hydrated: cartHydrated,
    cartOutletId,
  } = useCartStore();
  const { selectedOutlet, outletRevision } = useOutletStore();

  useEffect(() => {
    const initCart = async () => {
      if (!authHydrated || !cartHydrated) return;

      if (!isLoggedIn) {
        router.replace("/login?redirect=/cart/checkout");
        return;
      }
      if (!addressId) {
        router.replace("/cart");
        return;
      }
      if (cartItems.length === 0) {
        await loadCart(isLoggedIn);
      }
      setInitializing(false);
    };
    void initCart();
  }, [
    authHydrated,
    cartHydrated,
    isLoggedIn,
    addressId,
    loadCart,
    router,
    cartItems.length,
  ]);

  useEffect(() => {
    if (initializing || !addressId) return;

    let cancelled = false;

    const syncAddressAndLoadCheckout = async () => {
      setSyncingAddress(true);
      setAddressOutOfService(false);
      setAddressValidationMessage(null);
      setOutletResolutionError(null);

      try {
        const address = await AddressService.getOne(addressId);
        const { outletId: checkoutOutletId, outletName, error } =
          resolveCheckoutOutletId();

        setOutletResolutionError(error ?? null);

        if (!checkoutOutletId) {
          if (!loading && cartItems.length === 0) {
            router.replace("/home");
          }
          return;
        }

        const validation = validateAddressForCheckout({
          address,
          cartOutletId: checkoutOutletId,
          cartOutletName: outletName,
        });

        if (validation.status !== "ok") {
          setAddressOutOfService(true);
          setAddressValidationMessage(validation.message);
          setSummary(null);
          setLoading(false);
          return;
        }

        useLocationStore.getState().setDeliveryAddress({
          lat: address.latitude,
          lng: address.longitude,
          label: address.label || address.addressText,
          formattedAddress: address.addressText,
          source: "saved",
        });

        traceOutletBinding({
          stage: "checkout.syncAddress",
          selectedOutletId: selectedOutlet?.id ?? null,
          cartOutletId: checkoutOutletId,
          checkoutOutletId: validation.checkoutOutletId,
          resolvedOutletId: address.resolvedOutletId ?? null,
        });

        await loadSummary(addressId, validation.checkoutOutletId);
        await checkActiveCheckout(validation.checkoutOutletId);
      } catch (error) {
        console.error("Checkout address sync failed:", error);
        if (!cancelled) {
          setLoadErrorTitle("Checkout unavailable");
          setLoadError("Could not verify your delivery address.");
        }
      } finally {
        if (!cancelled) setSyncingAddress(false);
      }
    };

    void syncAddressAndLoadCheckout();

    return () => {
      cancelled = true;
    };
  }, [
    initializing,
    addressId,
    selectedOutlet?.id,
    outletRevision,
    cartOutletId,
    cartItems,
    router,
  ]);

  const checkActiveCheckout = async (outletId: string) => {
    try {
      const active = await CheckoutApi.getActiveCheckout(outletId);
      if (active && active.status === "PAYMENT_PENDING") {
        setPendingOrderModal({
          isOpen: true,
          orderId: active.orderId,
          orderNumber: active.orderNumber,
        });
      }
    } catch {
      // non-blocking
    }
  };

  const loadSummary = async (addrId: string, outId: string) => {
    try {
      setLoading(true);
      setLoadError(null);
      setLoadErrorTitle(null);
      const data = await CheckoutApi.getSummary(addrId, outId);
      setSummary(data);
    } catch (error) {
      console.error("Summary Error:", error);
      const mapped = mapCheckoutSummaryError(error);
      setLoadErrorTitle(mapped.title);
      setLoadError(mapped.message);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    const { outletId: currentOutletId, error } = resolveCheckoutOutletId();

    if (!addressId || !summary || !currentOutletId || processing || checkoutOpen) {
      if (error) toast.error(error);
      else if (loadError) toast.error(loadError);
      return;
    }

    traceOutletBinding({
      stage: "checkout.startPayment",
      selectedOutletId: useOutletStore.getState().selectedOutlet?.id,
      cartOutletId: useCartStore.getState().cartOutletId,
      checkoutOutletId: currentOutletId,
    });

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

    savePaymentSession({
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      paymentId: data.paymentId,
      addressId: addressId ?? undefined,
      amount: String(data.grandTotal),
      startedAt: Date.now(),
    });

    const razorpayKey = data.key ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

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
      const params = new URLSearchParams({
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        paymentId: data.paymentId,
        addressId: addressId ?? "",
        amount: String(data.grandTotal),
        failed: "true",
      });
      router.replace(`/payment/process?${params.toString()}`);
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

  const paymentBlockReason = useMemo(() => {
    if (addressOutOfService && addressValidationMessage) {
      return addressValidationMessage;
    }
    if (outletResolutionError) return outletResolutionError;
    if (loadError) return loadError;
    return null;
  }, [
    addressOutOfService,
    addressValidationMessage,
    outletResolutionError,
    loadError,
  ]);

  const isPreparing =
    initializing || loading || syncingAddress || !authHydrated || !cartHydrated;
  const isPaymentDisabled =
    isPreparing ||
    processing ||
    checkoutOpen ||
    !summary ||
    Boolean(paymentBlockReason);

  const handleRetrySummary = () => {
    const { outletId } = resolveCheckoutOutletId();
    if (addressId && outletId) {
      void loadSummary(addressId, outletId);
    }
  };

  const statusMessage = isPreparing
    ? initializing
      ? "Syncing your cart..."
      : "Preparing your checkout..."
    : undefined;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Header />

      {pendingOrderModal.isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-6 max-w-[340px] w-full shadow-2xl text-center animate-in fade-in zoom-in duration-200">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-3">
                Order in Progress
              </h2>
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
                  onClick={() =>
                    router.push(`/orders/${pendingOrderModal.orderId}`)
                  }
                  className="w-full bg-[#059669] hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl"
                >
                  View Order
                </button>

                <button
                  onClick={() =>
                    setPendingOrderModal({
                      isOpen: false,
                      orderId: null,
                      orderNumber: null,
                    })
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

      <main className="customer-page-shell customer-page-shell--checkout-bar mobile-container max-w-5xl pb-32">
        <Breadcrumbs
          items={[
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />

        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center font-medium text-slate-500 hover:text-emerald-600 md:hidden"
        >
          <ArrowLeft size={18} className="mr-2" /> Back
        </button>

        <h1 className={`${typography.pageTitle} mb-6`}>Review & Pay</h1>

        {statusMessage ? (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        ) : null}

        {(loadError || loadErrorTitle) && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            {loadErrorTitle ? (
              <h2 className="text-sm font-bold text-amber-950">{loadErrorTitle}</h2>
            ) : null}
            {loadError ? (
              <p className="mt-1 text-sm text-amber-900">{loadError}</p>
            ) : null}
            {addressId && selectedOutlet?.id ? (
              <button
                type="button"
                onClick={handleRetrySummary}
                className="mt-3 text-sm font-semibold text-emerald-700 underline"
              >
                Try again
              </button>
            ) : null}
          </div>
        )}

        {addressOutOfService ? (
          <CheckoutOutOfServiceState
            message={
              addressValidationMessage ??
              "Your selected delivery address is outside our delivery area. Please choose another address."
            }
          />
        ) : summary ? (
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
                    <p className="font-bold text-lg text-slate-800">
                      {summary.address.label}
                    </p>
                    <p className="text-slate-500 leading-relaxed">
                      {summary.address.addressText}
                    </p>
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
                            <h4 className="font-bold text-slate-800">
                              {item.productName}
                            </h4>
                            <span className="font-bold text-slate-900">
                              ₹{item.lineTotal}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {item.quantity} x ₹
                            {computeLineTotal(
                              item.unitPrice,
                              item.discountPrice,
                              1,
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:sticky lg:top-32">
                <h3 className="font-bold text-slate-900 mb-4">Bill Details</h3>

                <OrderSummaryBreakdown
                  subtotal={summary.subtotal}
                  discount={summary.discount}
                  netSubtotal={summary.netSubtotal ?? summary.afterDiscountTotal}
                  deliveryFee={summary.deliveryFee}
                  grandTotal={summary.grandTotal}
                  remainingForFreeDelivery={
                    summary.remainingForFreeDelivery ??
                    summary.remainingAmountForFreeDelivery
                  }
                  totalLabel="Total Payable"
                  className="space-y-3 text-sm text-slate-600 pb-4 border-b border-slate-100"
                  totalClassName="flex justify-between items-center py-4 font-extrabold text-xl text-slate-900"
                />
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <CheckoutPaymentBar
        grandTotal={summary?.grandTotal ?? null}
        onPay={handlePay}
        disabled={isPaymentDisabled}
        showSpinner={isPreparing || processing}
        checkoutOpen={checkoutOpen}
        blockReason={paymentBlockReason}
        preparingLabel={statusMessage ?? "Preparing checkout..."}
      />
    </div>
  );
}
