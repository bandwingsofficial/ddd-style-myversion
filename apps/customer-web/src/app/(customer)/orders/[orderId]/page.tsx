"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { 
  CheckCircle, Clock, MapPin, Package, Home, 
  Loader2, AlertCircle, Truck, XCircle, 
  ChevronLeft, UtensilsCrossed, ReceiptText,
  Calendar, CreditCard, ShieldCheck, Timer
} from "lucide-react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

interface OrderDetails {
  id: string; customerId: string; outletId: string; cartId: string;
  status: string; address: { id: string; label: string; addressText: string; };
  subtotal: number; discount: number; afterDiscountTotal: number;
  deliveryFee: number; grandTotal: number; itemCount: number;
  items: { id: string; productId: string; productName: string; productImage: string; quantity: number; unitPrice: number; totalPrice: number; }[];
  createdAt: string;
}

const BACKEND_URL = "https://api.dev.local:4000";
const getImageUrl = (path?: string) => {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // ✅ Real-time Fetching Function
  const fetchOrder = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const data = await CheckoutApi.getOrder(orderId as string);
      setOrder(data);
    } catch (error) {
      console.error("Order fetch failed", error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // ✅ Initial Load + Real-time Polling
  useEffect(() => {
    if (orderId) {
      fetchOrder();
      
      // Poll every 10 seconds if order is not terminal
      const interval = setInterval(() => {
        // We check the latest state directly from the current 'order' state
        if (order?.status !== "DELIVERED" && order?.status !== "CANCELLED") {
          fetchOrder(true); 
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [orderId, order?.status, fetchOrder]);

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure?")) return;
    setProcessing(true);
    try {
      await CheckoutApi.cancelOrder(orderId as string);
      fetchOrder();
    } catch (error) {
      alert("Could not cancel.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
    </div>
  );
  
  if (!order) return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
      <AlertCircle size={50} className="text-slate-200" />
      <p className="font-bold text-slate-400">Order not found.</p>
      <Link href="/orders" className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm">Return to Orders</Link>
    </div>
  );

  // ✅ REAL-TIME STATUS LOGIC
  const statusUpper = order.status ? order.status.toUpperCase() : "PENDING";
  
  const isCancelled = statusUpper === "CANCELLED";
  const isDelivered = statusUpper === "DELIVERED";
  const isReady = ["READY", "OUT_FOR_DELIVERY", "SHIPPED"].includes(statusUpper);
  const isPreparing = ["PREPARING", "ACCEPTED", "KITCHEN", "PROCESSING"].includes(statusUpper);
  const isPaid = ["PAID", "CONFIRMED"].includes(statusUpper);
  
  // Pending is only if it's not even paid yet (e.g., PAYMENT_PENDING)
  const isPending = statusUpper.includes("PENDING") && !isPaid;

  const steps = [
    { label: "Confirmed", active: isPaid || isPreparing || isReady || isDelivered, icon: CheckCircle },
    { label: "Preparing", active: isPreparing || isReady || isDelivered, icon: UtensilsCrossed },
    { label: "On the way", active: isReady || isDelivered, icon: Truck },
    { label: "Delivered", active: isDelivered, icon: Package },
  ];

  // Calculate Progress Bar Width based on actual DB status
  const getProgressWidth = () => {
    if (isDelivered) return '100%';
    if (isReady) return '66%';
    if (isPreparing) return '33%';
    if (isPaid) return '12%'; // Just started
    return '0%';
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] selection:bg-emerald-100">
      <Header />
      
      <main className="pt-32 pb-16 px-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/orders" className="group flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-all">
            <div className="p-1.5 rounded-full bg-white border border-slate-200 group-hover:bg-emerald-50 shadow-sm">
              <ChevronLeft size={16} />
            </div>
            <span className="font-bold text-xs">History</span>
          </Link>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
            <div className={`w-1.5 h-1.5 bg-emerald-500 rounded-full ${!isCancelled && !isDelivered ? 'animate-pulse' : ''}`} /> 
            {isCancelled || isDelivered ? 'Order Summary' : 'Live Tracking'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Status: {statusUpper.replace('_', ' ')}</p>
                <h1 className="text-2xl font-black text-slate-900 mb-6 animate-shine">
                  #{order.id.slice(-8).toUpperCase()}
                </h1>

                {!isCancelled ? (
                  <div className="relative flex justify-between items-start px-2">
                    <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-100 z-0 rounded-full" />
                    <div 
                      className="absolute top-4 left-0 h-0.5 bg-emerald-500 z-0 transition-all duration-1000 rounded-full" 
                      style={{ width: getProgressWidth() }}
                    />
                    
                    {steps.map((step, idx) => (
                      <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-[3px] ${
                          step.active ? "bg-emerald-500 border-white text-white shadow-md shadow-emerald-100" : "bg-white border-slate-50 text-slate-200"
                        }`}>
                          <step.icon size={14} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${step.active ? "text-slate-900" : "text-slate-400"}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <XCircle className="text-rose-500" size={24} />
                    <h3 className="font-black text-rose-700 uppercase text-sm italic">Order Cancelled</h3>
                  </div>
                )}
              </div>

              {/* Only show cancel option if it's strictly PENDING or just PAID (not yet in kitchen) */}
              {(isPending || isPaid) && !isCancelled && !isPreparing && !isReady && !isDelivered && (
                <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                  <p className="text-[10px] font-medium text-slate-400 max-w-[180px]">Cancel before the kitchen starts.</p>
                  <button 
                    onClick={handleCancelOrder}
                    disabled={processing}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-bold text-[10px] hover:bg-rose-100 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {processing ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                    Cancel Order
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ReceiptText className="text-emerald-500" size={18} />
                  Manifest
                </h2>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                  {order.items.length} Items
                </span>
              </div>

              <div className="grid gap-3">
                {order.items.map((item) => (
                  <div key={item.id} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                      <img 
                        src={getImageUrl(item.productImage) || ""} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        alt={item.productName} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 text-base truncate mb-0.5">{item.productName}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          x{item.quantity}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">₹{item.unitPrice}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-slate-900 tracking-tighter">₹{item.totalPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Destination</p>
                    <h3 className="text-lg font-bold mb-0.5">{order.address.label}</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm line-clamp-1">{order.address.addressText}</p>
                  </div>
                </div>
                <div className="pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-6">
                  <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                    <Calendar size={14} className="text-emerald-500" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-4">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="p-6">
                  <h3 className="font-black text-slate-900 text-base mb-5 flex items-center gap-2">
                    <CreditCard size={18} className="text-slate-400" /> Summary
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="text-slate-900">₹{order.subtotal}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-emerald-600">Savings</span>
                        <span className="text-emerald-600">-₹{order.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Fee</span>
                      <span className={order.deliveryFee === 0 ? "text-emerald-600" : "text-slate-900"}>
                        {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-50">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Paid Total</p>
                          <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{order.grandTotal}</p>
                        </div>
                        <div className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mb-1">
                          GST INCL.
                        </div>
                      </div>
                    </div>
                  </div>

                  <Link href="/home" className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-4 rounded-[1.2rem] font-black text-xs hover:bg-emerald-700 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-emerald-200">
                    <Home size={16} /> Home Dashboard
                  </Link>
                </div>
                
                <div className="h-1.5 w-full flex bg-slate-50">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="flex-1 h-full bg-white rounded-full -mt-0.5 mx-0.5" />
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Support</p>
                <button className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700">
                  Contact us regarding order #{order.id.slice(-4)} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}