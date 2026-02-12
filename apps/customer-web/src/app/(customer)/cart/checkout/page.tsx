"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Script from "next/script"; 
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { CheckoutSummary, CheckoutErrorResponse } from "@/features/checkout/checkout.types";
import { useCartStore } from "@/features/cart/cart.store";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { ArrowLeft, ShieldCheck, Loader2, MapPin, TicketPercent, Bike, ShoppingCart, ExternalLink } from "lucide-react";
import Header from "@/components/customer/Header";

const BACKEND_URL = "https://api.dev.local:4000";
const getImageUrl = (path?: string) => path?.startsWith("http") ? path : `${BACKEND_URL}/${path}`;

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
  const [initializing, setInitializing] = useState(true);
  
  // Custom Modal State
  const [pendingOrderModal, setPendingOrderModal] = useState<{ isOpen: boolean; orderId: string | null }>({
    isOpen: false,
    orderId: null
  });

  // Stores
  const { isAuthenticated, isHydrated: authHydrated } = useCustomerAuthStore();
  const { items: cartItems, loadCart, clear, hydrated: cartHydrated } = useCartStore();
  const { selectedOutlet } = useOutletStore();

  // 1. INITIALIZATION
  useEffect(() => {
    const initCart = async () => {
      if (!authHydrated || !cartHydrated) return;

      if (!isAuthenticated) {
        router.replace("/login?redirect=/checkout");
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
    initCart();
  }, [authHydrated, cartHydrated, isAuthenticated, addressId, loadCart, router, cartItems.length]);

  // 2. FETCH SUMMARY
  useEffect(() => {
    if (initializing) return;

    const currentOutletId = cartItems[0]?.outletId || selectedOutlet?.id;

    if (!currentOutletId) {
       if (!loading && cartItems.length === 0) { 
           router.replace("/home");
       }
       return;
    }

    loadSummary(addressId!, currentOutletId);
  }, [initializing]); 

  const loadSummary = async (addrId: string, outId: string) => {
    try {
      setLoading(true);
      const data = await CheckoutApi.getSummary(addrId, outId);
      setSummary(data);
    } catch (error: any) {
      console.error("Summary Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    const currentOutletId = useCartStore.getState().items[0]?.outletId || useOutletStore.getState().selectedOutlet?.id;

    if (!addressId || !summary || !currentOutletId) {
        return;
    }

    setProcessing(true);
    try {
      const data = await CheckoutApi.startCheckout({
        savedAddressId: addressId,
        outletId: currentOutletId
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: data.amount,
        currency: data.currency,
        name: "Cane & Tender",
        description: "Order Payment",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
           await clear(false); 
           
           const params = new URLSearchParams({
             orderId: data.orderId,
             paymentId: data.paymentId,
             rzp_payment_id: response.razorpay_payment_id,
             rzp_order_id: response.razorpay_order_id,
             rzp_signature: response.razorpay_signature,
             amount: summary.grandTotal.toString()
           });

           router.replace(`/payment/process?${params.toString()}`);
        },
        prefill: {
          name: "Customer", 
          contact: "9999999999" 
        },
        theme: { color: "#10B981" },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error: any) {
      const errData = error.response?.data as CheckoutErrorResponse;
      
      if (errData?.code === "ORDER_ALREADY_IN_PROGRESS" && errData?.metadata?.orderId) {
          setPendingOrderModal({
            isOpen: true,
            orderId: errData.metadata.orderId
          });
          setProcessing(false);
          return;
      }

      console.error("Checkout Error:", error);
      alert(errData?.message || "Could not initiate payment.");
      setProcessing(false);
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
      
      {/* PENDING ORDER MODAL - Teleported to document.body to ensure it sits above the Header */}
      {pendingOrderModal.isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 max-w-[340px] w-full shadow-2xl text-center animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-3">Order in Progress</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 px-1">
              You already have a pending payment for a previous order. You must complete or cancel that before starting a new one.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => router.push(`/orders/${pendingOrderModal.orderId}`)}
                className="w-full bg-[#059669] hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                Go to Pending Order <ExternalLink size={16} />
              </button>
              
              <button 
                onClick={() => router.push('/cart')}
                className="w-full bg-[#F1F5F9] hover:bg-slate-200 text-[#0F172A] font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingCart size={16} /> Back to Cart
              </button>

              <button 
                onClick={() => setPendingOrderModal({ isOpen: false, orderId: null })}
                className="mt-4 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors inline-block"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <main className="pt-36 pb-12 px-4 max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-emerald-600 mb-6 font-medium">
          <ArrowLeft size={18} className="mr-2" /> Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">Review & Pay</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 p-3 rounded-full text-emerald-600"><MapPin size={24} /></div>
                <div>
                  <h3 className="font-bold text-slate-900 uppercase tracking-wide text-xs mb-1">Delivery Address</h3>
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
                {summary.items.map((item) => (
                  <div key={item.productId} className="p-4 flex gap-4">
                    <img 
                      src={getImageUrl(item.productImage)} 
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover bg-slate-100" 
                    />
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
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-32">
              <h3 className="font-bold text-slate-900 mb-4">Bill Details</h3>
              
              <div className="space-y-3 text-sm text-slate-600 pb-4 border-b border-slate-100">
                <div className="flex justify-between"><span>Item Total</span> <span>₹{summary.subtotal}</span></div>
                {summary.discount > 0 && (
                   <div className="flex justify-between text-emerald-600">
                     <span className="flex items-center gap-1"><TicketPercent size={14}/> Discount</span> 
                     <span>- ₹{summary.discount}</span>
                   </div>
                )}
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Bike size={14}/> Delivery Fee</span> 
                  <span className={summary.deliveryFee === 0 ? "text-emerald-600 font-bold" : ""}>
                    {summary.deliveryFee === 0 ? "Free" : `₹${summary.deliveryFee}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 font-extrabold text-xl text-slate-900">
                <span>To Pay</span>
                <span>₹{summary.grandTotal}</span>
              </div>

              <button 
                onClick={handlePay}
                disabled={processing}
                className="w-full bg-[#059669] hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processing ? <Loader2 className="animate-spin" /> : <ShieldCheck />} 
                {processing ? "Processing..." : `Pay ₹${summary.grandTotal}`}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}