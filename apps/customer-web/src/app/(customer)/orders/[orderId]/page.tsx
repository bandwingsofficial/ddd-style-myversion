"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script"; 
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { OrderDetails, CheckoutErrorResponse } from "@/features/checkout/checkout.types";
import { CheckCircle, Clock, MapPin, Package, Home, Loader2, AlertCircle, Truck, CreditCard } from "lucide-react";
import Header from "@/components/customer/Header";

const BACKEND_URL = "https://api.dev.local:4000";
const getImageUrl = (path?: string) => path?.startsWith("http") ? path : `${BACKEND_URL}/${path}`;

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (orderId) fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const data = await CheckoutApi.getOrder(orderId as string);
      setOrder(data);
    } catch (error) {
      console.error("Order fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIC: Reuse the address from the current order to retry payment
  const handleCompletePayment = async () => {
    if (!order) return;
    
    // Safety Check: Ensure Address ID exists (Backend must return it!)
    if (!order.address?.id) {
        alert("Cannot retry: Address ID is missing from order details. Please contact support.");
        return;
    }

    setRetrying(true);
    try {
      // 1. Restart Checkout with the SAME address ID from the order
      const data = await CheckoutApi.startCheckout({
        savedAddressId: order.address.id, 
        outletId: order.outletId
      });

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: data.amount,
        currency: data.currency,
        name: "Cane & Tender",
        description: `Payment for Order #${order.id.slice(0, 8)}`,
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
           const params = new URLSearchParams({
             orderId: data.orderId,
             paymentId: data.paymentId,
             rzp_payment_id: response.razorpay_payment_id,
             rzp_order_id: response.razorpay_order_id,
             rzp_signature: response.razorpay_signature,
             amount: order.grandTotal.toString()
           });
           router.replace(`/payment/process?${params.toString()}`);
        },
        theme: { color: "#ea580c" }, // Matches 'Pending' color
        modal: {
          ondismiss: function() { setRetrying(false); }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error: any) {
      const errData = error.response?.data as CheckoutErrorResponse;
      
      // If backend says "Order Already Exists", it usually returns the ID. 
      // In this case, we ARE the existing order, so we might need a dedicated /resume endpoint
      // But usually, startCheckout handles this or we ignore the error if it returns valid Razorpay data.
      
      console.error("Retry failed", error);
      alert(errData?.message || "Could not restart payment.");
      setRetrying(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600 w-10 h-10" /></div>;
  
  if (!order) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 text-slate-500">
        <AlertCircle size={48} className="text-slate-300" />
        <p>Order details not found.</p>
        <Link href="/orders" className="text-emerald-600 font-bold hover:underline">Back to Orders</Link>
    </div>
  );

  const status = order.status.toUpperCase();
  const isPaid = status === "PAID";
  const isDelivered = status === "DELIVERED";
  const isPending = status === "PAYMENT_PENDING";

  let bannerColor = "bg-amber-500 text-white shadow-amber-500/20";
  let bannerIcon = <Clock size={32} />;
  let bannerTitle = "Order Pending";

  if (isDelivered) {
    bannerColor = "bg-blue-600 text-white shadow-blue-600/20";
    bannerIcon = <Truck size={32} />;
    bannerTitle = "Order Delivered";
  } else if (isPaid) {
    bannerColor = "bg-emerald-600 text-white shadow-emerald-600/20";
    bannerIcon = <CheckCircle size={32} />;
    bannerTitle = "Order Confirmed";
  } else if (status === "FAILED" || status === "CANCELLED") {
    bannerColor = "bg-red-500 text-white shadow-red-500/20";
    bannerIcon = <AlertCircle size={32} />;
    bannerTitle = `Order ${status === "FAILED" ? "Failed" : "Cancelled"}`;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Header />
      <main className="pt-32 pb-12 px-4 max-w-4xl mx-auto">
        
        {/* Status Banner */}
        <div className={`rounded-3xl p-8 mb-8 text-center shadow-lg transition-all ${bannerColor}`}>
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            {bannerIcon}
          </div>
          <h1 className="text-3xl font-extrabold mb-2">{bannerTitle}</h1>
          <p className="opacity-90 text-lg">Order ID: #{order.id.slice(0, 8).toUpperCase()}</p>

          {/* ✅ COMPLETE PAYMENT BUTTON */}
          {isPending && (
             <div className="mt-6 flex flex-col items-center gap-3">
                 <button 
                    onClick={handleCompletePayment}
                    disabled={retrying}
                    className="bg-white text-amber-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-amber-50 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                 >
                    {retrying ? <Loader2 className="animate-spin" size={20}/> : <CreditCard size={20}/>}
                    {retrying ? "Processing..." : "Complete Payment"}
                 </button>
                 <p className="text-white/80 text-sm">You must complete this payment to place new orders.</p>
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Package size={20}/> Order Items</h2>
              <div className="divide-y divide-slate-50">
                {order.items.map((item: any) => (
                  <div key={item.id} className="py-4 flex gap-4">
                    <img 
                      src={getImageUrl(item.productImage)} 
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover bg-slate-100" 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-800">{item.productName}</span>
                        <span className="font-bold">₹{item.totalPrice}</span>
                      </div>
                      <p className="text-slate-500 text-sm mt-1">{item.quantity} x ₹{item.unitPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPin size={20}/> Delivery To</h2>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-900 mb-1">{order.address.label}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{order.address.addressText}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-32">
              <h2 className="font-bold text-slate-800 mb-4">Payment Summary</h2>
              <div className="space-y-3 text-sm border-b border-slate-100 pb-4 mb-4">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span> <span>₹{order.subtotal}</span></div>
                {order.discount > 0 && (
                   <div className="flex justify-between text-emerald-600"><span>Discount</span> <span>- ₹{order.discount}</span></div>
                )}
                <div className="flex justify-between text-slate-500"><span>Delivery</span> <span>₹{order.deliveryFee}</span></div>
              </div>
              <div className="flex justify-between font-extrabold text-xl text-slate-900">
                <span>Total Paid</span>
                <span>₹{order.grandTotal}</span>
              </div>

              <div className="mt-8">
                <Link href="/" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition">
                  <Home size={18} /> Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}