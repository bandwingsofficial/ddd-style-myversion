"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { CheckoutSummary } from "@/features/checkout/checkout.types";
import { useCartStore } from "@/features/cart/cart.store";
import { ArrowLeft, ShieldCheck, Loader2, MapPin, TicketPercent, Bike } from "lucide-react";
import Header from "@/components/customer/Header";

const BACKEND_URL = "https://api.dev.local:4000";
const getImageUrl = (path?: string) => path?.startsWith("http") ? path : `${BACKEND_URL}/${path}`;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addressId = searchParams.get("addressId");
  
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // ✅ FIX: Ensure we are using the store correctly
  const clearCart = useCartStore((s) => s.clear);

  useEffect(() => {
    if (!addressId) {
      router.replace("/cart");
      return;
    }
    loadSummary();
  }, [addressId]);

  const loadSummary = async () => {
    try {
      const data = await CheckoutApi.getSummary(addressId!);
      setSummary(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load checkout summary. Please try again.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!addressId) return;
    setProcessing(true);
    try {
      // 1. Start Checkout -> Get Order ID & Payment Details
      const response = await CheckoutApi.startCheckout(addressId);
      
      // 2. Clear Local Cart
      // ✅ FIX: Pass 'true' because the user is logged in during checkout
      // This satisfies the TS error: Expected 1 arguments, but got 0
      await clearCart(true); 

      // 3. Redirect to Payment Processing
      const params = new URLSearchParams({
        orderId: response.orderId,
        paymentId: response.paymentId,
        amount: summary?.grandTotal.toString() || "0"
      });
      
      router.push(`/payment/process?${params.toString()}`);

    } catch (error) {
      console.error(error);
      alert("Could not initiate payment.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;
  if (!summary) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="pt-36 pb-12 px-4 max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-emerald-600 mb-6 font-medium">
          <ArrowLeft size={18} className="mr-2" /> Back
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-6">Review & Pay</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Items & Address */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Card */}
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

            {/* Items */}
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
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1"><TicketPercent size={14}/> Discount</span> 
                  <span>- ₹{summary.discount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1"><Bike size={14}/> Delivery Fee</span> 
                  <span>₹{summary.deliveryFee}</span>
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