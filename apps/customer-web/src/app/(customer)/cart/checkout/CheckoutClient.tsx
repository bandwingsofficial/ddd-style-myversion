"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import Header from "@/components/customer/Header";
import AddressSelectionModal from "@/components/address/AddressSelectionModal";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { OrderSummaryBreakdown } from "@/features/orders/components/OrderSummaryBreakdown";

import { CheckoutApi } from "@/features/checkout/checkout.api";
import { CheckoutSummary } from "@/features/checkout/checkout.types";
import { useCartStore } from "@/features/cart/cart.store";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { getProductImageUrl } from "@/lib/image-url";
import { computeLineTotal } from "@/lib/cart-pricing";
import {
  resolveCheckoutOutletId,
  traceOutletBinding,
} from "@/features/checkout/resolve-checkout-outlet.util";
import { validateAddressForCheckout } from "@/features/checkout/validate-address-outlet.util";
import { mapCheckoutSummaryError } from "@/features/checkout/checkout-error.util";
import { Address, AddressService } from "@/features/addresses/address.service";
import { useLocationStore } from "@/features/location/location.store";
import { CheckoutOutOfServiceState } from "@/components/location/NoDeliveryState";
import { typography } from "@/lib/design-tokens";
import { openRazorpayCheckout } from "@/features/checkout/razorpay.util";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAddressId = searchParams.get("addressId");

  const [addressId, setAddressId] = useState<string | null>(initialAddressId);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadErrorTitle, setLoadErrorTitle] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [itemUpdating, setItemUpdating] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [outletResolutionError, setOutletResolutionError] = useState<string | null>(null);
  const [addressOutOfService, setAddressOutOfService] = useState(false);
  const [addressValidationMessage, setAddressValidationMessage] = useState<string | null>(null);
  const [syncingAddress, setSyncingAddress] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const { isLoggedIn, isHydrated: authHydrated } = useCustomerSession();
  const {
    items: cartItems,
    loadCart,
    updateItem,
    removeItem,
    hydrated: cartHydrated,
    cartOutletId,
  } = useCartStore();

  const loadSummary = useCallback(
    async (addrId: string, outId: string) => {
      try {
        setLoading(true);
        setLoadError(null);
        setLoadErrorTitle(null);
        const data = await CheckoutApi.getSummary(addrId, outId);
        setSummary(data);
      } catch (error) {
        const mapped = mapCheckoutSummaryError(error);
        setLoadErrorTitle(mapped.title);
        setLoadError(mapped.message);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const refreshCheckout = useCallback(
    async (addrId: string) => {
      const { outletId: checkoutOutletId, error } = resolveCheckoutOutletId();
      setOutletResolutionError(error ?? null);
      if (!checkoutOutletId) return;
      await loadCart(isLoggedIn);
      await loadSummary(addrId, checkoutOutletId);
    },
    [isLoggedIn, loadCart, loadSummary],
  );

  useEffect(() => {
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
      void loadCart(isLoggedIn);
    }
    setInitializing(false);
  }, [authHydrated, cartHydrated, isLoggedIn, addressId, loadCart, router, cartItems.length]);

  useEffect(() => {
    if (initializing || !addressId) return;

    let cancelled = false;

    const sync = async () => {
      setSyncingAddress(true);
      setAddressOutOfService(false);
      setAddressValidationMessage(null);
      setOutletResolutionError(null);

      try {
        const address = await AddressService.getOne(addressId);
        const { outletId: checkoutOutletId, outletName, error } =
          resolveCheckoutOutletId();
        setOutletResolutionError(error ?? null);
        if (!checkoutOutletId) return;

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
          selectedOutletId: useOutletStore.getState().selectedOutlet?.id ?? null,
          cartOutletId: checkoutOutletId,
          checkoutOutletId: validation.checkoutOutletId,
          resolvedOutletId: address.resolvedOutletId ?? null,
        });

        await loadSummary(addressId, validation.checkoutOutletId);
      } catch {
        if (!cancelled) {
          setLoadErrorTitle("Checkout unavailable");
          setLoadError("Could not verify your delivery address.");
        }
      } finally {
        if (!cancelled) setSyncingAddress(false);
      }
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, [initializing, addressId, cartOutletId, cartItems, loadSummary]);

  const handleQuantityChange = async (
    productId: string,
    currentQty: number,
    delta: number,
  ) => {
    if (itemUpdating || !addressId) return;
    const newQty = currentQty + delta;
    setItemUpdating(productId);
    try {
      if (newQty <= 0) await removeItem(productId);
      else await updateItem(productId, newQty);
      await refreshCheckout(addressId);
    } finally {
      setItemUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (itemUpdating || !addressId) return;
    setItemUpdating(productId);
    try {
      await removeItem(productId);
      await refreshCheckout(addressId);
    } finally {
      setItemUpdating(null);
    }
  };

  const handleAddressSelect = (address: Address) => {
    setIsAddressModalOpen(false);
    setAddressId(address.id);
    router.replace(`/cart/checkout?addressId=${address.id}`);
  };

  const handlePay = async () => {
    const { outletId: currentOutletId, error } = resolveCheckoutOutletId();
    if (!addressId || !summary || !currentOutletId || processing) {
      if (error) toast.error(error);
      return;
    }

    setProcessing(true);
    try {
      const checkoutData = await CheckoutApi.startCheckout({
        savedAddressId: addressId,
        outletId: currentOutletId,
        orderNotes: orderNotes.trim() || undefined,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
      });

      router.push(`/orders/${checkoutData.orderId}/pay?autoPay=1`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not start checkout.");
    } finally {
      setProcessing(false);
    }
  };

  const paymentBlockReason = useMemo(() => {
    if (addressOutOfService && addressValidationMessage) return addressValidationMessage;
    if (outletResolutionError) return outletResolutionError;
    if (loadError) return loadError;
    if (!summary?.items?.length) return "Your cart is empty.";
    return null;
  }, [addressOutOfService, addressValidationMessage, outletResolutionError, loadError, summary]);

  const isPreparing =
    initializing || loading || syncingAddress || !authHydrated || !cartHydrated;
  const isPaymentDisabled = isPreparing || processing || !summary || Boolean(paymentBlockReason);

  if (!addressId) return null;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Header />

      <main className="customer-page-shell mobile-container max-w-5xl pb-16 mt-4">
        <Breadcrumbs
          items={[
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`${typography.pageTitle} text-slate-900`}>Checkout</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review your order before payment
            </p>
          </div>
          <Link
            href="/cart"
            className="hidden items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 sm:flex"
          >
            <ArrowLeft size={16} /> Back to cart
          </Link>
        </div>

        {isPreparing && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200/80">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            Preparing checkout...
          </div>
        )}

        {addressOutOfService ? (
          <CheckoutOutOfServiceState message={addressValidationMessage ?? ""} />
        ) : summary ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="space-y-5 lg:col-span-3">
              {/* Address */}
              <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200/80">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">Delivery address</h2>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-sm font-medium text-[#00a300] hover:text-[#166534]"
                  >
                    Change
                  </button>
                </div>
                <div className="flex gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">{summary.address.label}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                      {summary.address.addressText}
                    </p>
                  </div>
                </div>
              </section>

              {/* Items */}
              <section className="rounded-xl bg-white ring-1 ring-slate-200/80">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Order items ({summary.itemCount})
                  </h2>
                  <Link
                    href="/home"
                    className="text-sm font-medium text-[#00a300] hover:text-[#166534]"
                  >
                    Add more
                  </Link>
                </div>
                <ul className="divide-y divide-slate-100">
                  {summary.items.map((item) => {
                    const imageUrl = getProductImageUrl(item.productImage);
                    const busy = itemUpdating === item.productId;
                    return (
                      <li key={item.productId} className="flex gap-4 px-5 py-4">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.productName}
                            className="h-16 w-16 shrink-0 rounded-lg object-cover bg-slate-100"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            <ShoppingBag size={18} className="text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-slate-900">{item.productName}</p>
                            <p className="shrink-0 font-semibold text-slate-900">
                              ₹{item.lineTotal}
                            </p>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            ₹{computeLineTotal(item.unitPrice, item.discountPrice, 1)} each
                          </p>
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex items-center rounded-lg ring-1 ring-slate-200">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  void handleQuantityChange(
                                    item.productId,
                                    item.quantity,
                                    -1,
                                  )
                                }
                                className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="min-w-[1.5rem] text-center text-sm font-medium">
                                {busy ? "…" : item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  void handleQuantityChange(
                                    item.productId,
                                    item.quantity,
                                    1,
                                  )
                                }
                                className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void handleRemoveItem(item.productId)}
                              className="text-slate-400 hover:text-red-600 disabled:opacity-50"
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-slate-100 px-5 py-3">
                  <Link
                    href="/menu"
                    className="text-sm font-medium text-[#00a300] hover:text-[#166534]"
                  >
                    Still craving something? 😋
                  </Link>
                </div>
              </section>

              {/* Notes */}
              <section className="rounded-xl bg-white p-5 ring-1 ring-slate-200/80">
                <label className="block text-sm font-semibold text-slate-900">
                  Order notes <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Any special requests?"
                  className="mt-2 w-full resize-none rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-600/30"
                />
                <label className="mt-4 block text-sm font-semibold text-slate-900">
                  Delivery instructions{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Gate code, landmark, etc."
                  className="mt-2 w-full resize-none rounded-lg border-0 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-600/30"
                />
              </section>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-4 rounded-xl bg-white p-5 ring-1 ring-slate-200/80">
                <h2 className="text-sm font-semibold text-slate-900">Payment summary</h2>

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
                  totalLabel="Total payable"
                  className="space-y-2.5 text-sm text-slate-600"
                  totalClassName="flex justify-between border-t border-slate-100 pt-3 text-base font-semibold text-slate-900"
                />

                {summary.estimatedDeliveryMinutes ? (
                  <p className="text-xs text-slate-500">
                    Estimated delivery: ~{summary.estimatedDeliveryMinutes} min
                  </p>
                ) : null}

                <p className="text-xs text-slate-400">
                  Secure payment via Razorpay. Your cart stays editable until payment succeeds.
                </p>

                {paymentBlockReason ? (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-100">
                    {paymentBlockReason}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => void handlePay()}
                  disabled={isPaymentDisabled}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#00a300] text-sm font-semibold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Pay ₹{summary.grandTotal}
                </button>

                <Link
                  href="/cart"
                  className="flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Back to cart
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelect={handleAddressSelect}
      />
    </div>
  );
}
