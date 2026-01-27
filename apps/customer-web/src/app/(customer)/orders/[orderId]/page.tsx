"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { OrderDetails } from "@/features/checkout/checkout.types";
import { CheckCircle, Clock, MapPin, Package, Home, Loader2 } from "lucide-react";
import Header from "@/components/customer/Header";

const BACKEND_URL = "https://api.dev.local:4000";
const getImageUrl = (path?: string) => path?.startsWith("http") ? path : `${BACKEND_URL}/${path}`;

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const data = await CheckoutApi.getOrder(orderId as string);
      setOrder(data);
    } catch (error) {
      console.error("Order fetch failed", error);
      // Optional: Redirect to home or show error state
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;
  if (!order) return <div className="h-screen flex items-center justify-center">Order not found</div>;

  const isPaid = order.status === "PAID";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="pt-32 pb-12 px-4 max-w-4xl mx-auto">
        
        {/* Status Banner */}
        <div className={`rounded-3xl p-8 mb-8 text-center shadow-lg ${isPaid ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            {isPaid ? <CheckCircle size={32} /> : <Clock size={32} />}
          </div>
          <h1 className="text-3xl font-extrabold mb-2">{isPaid ? "Order Confirmed!" : "Order Pending"}</h1>
          <p className="opacity-90 text-lg">Order ID: #{order.id.slice(0, 8).toUpperCase()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Items */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Package size={20}/> Order Items</h2>
              <div className="divide-y divide-slate-50">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4">
                    <img 
                      src={getImageUrl(item.productImage)} 
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover bg-slate-50" 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-800">{item.productName}</span>
                        {/* Note: Order endpoint uses 'totalPrice', not 'lineTotal' */}
                        <span className="font-bold">₹{item.totalPrice}</span>
                      </div>
                      <p className="text-slate-500 text-sm mt-1">{item.quantity} x ₹{item.unitPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
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
                <div className="flex justify-between text-emerald-600"><span>Discount</span> <span>- ₹{order.discount}</span></div>
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