"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script"; 
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { CheckoutSummary, CheckoutErrorResponse } from "@/features/checkout/checkout.types";
import { useCartStore } from "@/features/cart/cart.store";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { ArrowLeft, ShieldCheck, Loader2, MapPin, TicketPercent, Bike } from "lucide-react";
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
      // Try to load cart if empty
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
       // Only redirect if completely stuck and not just loading
       if (!loading && cartItems.length === 0) { 
           alert("Could not identify the outlet. Redirecting to home.");
           router.replace("/home");
       }
       return;
    }

    loadSummary(addressId!, currentOutletId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializing]); 

  const loadSummary = async (addrId: string, outId: string) => {
    try {
      setLoading(true);
      const data = await CheckoutApi.getSummary(addrId, outId);
      setSummary(data);
    } catch (error: any) {
      console.error("Summary Error:", error);
      if (error.response?.status === 400) {
         console.warn("Cart might be invalid");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    const currentOutletId = useCartStore.getState().items[0]?.outletId || useOutletStore.getState().selectedOutlet?.id;

    if (!addressId || !summary || !currentOutletId) {
        alert("Missing checkout information. Please refresh.");
        return;
    }

    setProcessing(true);
    try {
      // 1. Create Order
      const data = await CheckoutApi.startCheckout({
        savedAddressId: addressId,
        outletId: currentOutletId
      });

      // 🛑 STOP: Do NOT clear cart here. Wait for payment success.

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: data.amount,
        currency: data.currency,
        name: "Cane & Tender",
        description: "Order Payment",
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
            
           // ✅ FIXED: Pass 'false' to clear only the frontend UI
           // This prevents the 400 Error because we don't call the Backend API
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
        theme: {
          color: "#10B981"
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            // Cart remains intact if they close the modal!
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error: any) {
      const errData = error.response?.data as CheckoutErrorResponse;
      
      if (errData?.code === "ORDER_ALREADY_IN_PROGRESS" && errData?.metadata?.orderId) {
          const existingOrderId = errData.metadata.orderId;
          if (confirm("You already have an order pending payment. Resume it?")) {
              router.push(`/orders/${existingOrderId}`);
          }
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
      <main className="pt-36 pb-12 px-4 max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-emerald-600 mb-6 font-medium">
          <ArrowLeft size={18} className="mr-2" /> Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">Review & Pay</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Items & Address */}
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

          {/* RIGHT: Bill Summary */}
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processing ? <Loader2 className="animate-spin" /> : <ShieldCheck />} 
                {processing ? "Processing..." : `Pay ₹${summary.grandTotal}`}
              </button>
              
              <div className="mt-4 flex justify-center gap-4 opacity-50 grayscale">
                 <img src="/icons/visa.png" className="h-4" alt="visa" onError={(e) => e.currentTarget.style.display = 'none'} />
                 <img src="/icons/upi.png" className="h-4" alt="upi" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}