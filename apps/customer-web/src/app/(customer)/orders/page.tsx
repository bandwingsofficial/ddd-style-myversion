"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { OrderDetails } from "@/features/checkout/checkout.types";
import { 
  Package, ChevronRight, Clock, CheckCircle, 
  XCircle, Calendar, Loader2, MapPin, 
  ShoppingBag, ArrowRight, ReceiptText, Hash,
  Truck, CreditCard, Timer
} from "lucide-react";
import Header from "@/components/customer/Header";

const BACKEND_URL = "https://api.dev.local:4000";
const getImageUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const getStatusTheme = (status: string) => {
  const s = status.toUpperCase();
  
  // 1. DELIVERED: Final state
  if (s === "DELIVERED") {
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-100",
      accent: "bg-emerald-500",
      icon: <CheckCircle size={14} />,
      label: "Delivered & Verified"
    };
  }

  // 2. PAID: Payment successful, but not yet delivered
  if (s === "PAID") {
    return {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-100",
      accent: "bg-blue-500",
      icon: <Timer size={14} className="animate-pulse" />,
      label: "Order Paid & Preparing"
    };
  }

  // 3. PAYMENT_PENDING: Initial state
  if (s === "PAYMENT_PENDING" || s === "PENDING") {
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-100",
      accent: "bg-amber-500",
      icon: <Clock size={14} className="animate-bounce" />,
      label: "Payment Pending"
    };
  }

  // 4. CANCELLED: Failed state
  if (s === "CANCELLED") {
    return {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-100",
      accent: "bg-rose-500",
      icon: <XCircle size={14} />,
      label: "Order Cancelled"
    };
  }

  // Default Fallback
  return {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-100",
    accent: "bg-slate-500",
    icon: <Hash size={14} />,
    label: s
  };
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]); // Use any temporarily to handle API structure variations
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await CheckoutApi.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-emerald-50 border-t-emerald-500 rounded-full animate-spin"></div>
        <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={20} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFBFC] font-sans pb-20">
      <Header />
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-emerald-50/50 blur-[120px]" />
        <div className="absolute top-[20%] -left-[5%] w-[30%] h-[30%] rounded-full bg-blue-50/40 blur-[100px]" />
      </div>

      <main className="relative z-10 pt-32 px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-4xl font-black text-slate-900 tracking-tight mb-3 animate-shine">
              Order History
            </h1>
          </div>
      
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="bg-emerald-500 p-2 rounded-xl text-white">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Total Orders</p>
              <p className="text-lg font-black text-slate-900 leading-none">{orders.length}</p>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-12 text-center border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-slate-200" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">No orders found</h2>
            <p className="text-slate-500 mt-2 mb-8">Time to start your first delicious journey!</p>
            <Link href="/menu" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all">
              Go to Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const theme = getStatusTheme(order.status);
              return (
                <Link 
                  href={`/orders/${order.id}`}
                  key={order.id}
                  className="group block relative bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500"
                >
                  <div className={`absolute left-0 top-12 bottom-12 w-1.5 rounded-r-full transition-all duration-500 group-hover:top-8 group-hover:bottom-8 ${theme.accent}`} />

                  <div className="p-6 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${theme.bg} ${theme.text}`}>
                          <Truck size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order</span>
                            {/* Updated: Using official orderNumber instead of id slice */}
                            <span className="text-lg font-black text-slate-900">
                              #{order.orderNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.bg} ${theme.text}`}>
                              {theme.icon} {theme.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 self-end md:self-center">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
                          <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{order.grandTotal}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-emerald-500 group-hover:text-emerald-500 transition-all group-hover:rotate-45">
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Summary</p>
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/50 border border-transparent group-hover:border-slate-100 transition-all">
                           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <Package className="text-emerald-500" size={24} />
                           </div>
                           <div>
                              <p className="font-bold text-slate-800 leading-tight">
                                {order.itemCount} {order.itemCount === 1 ? 'Item' : 'Items'}
                              </p>
                              <p className="text-xs font-medium text-slate-500">Deliciousness arriving soon</p>
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-4 p-6 rounded-[2rem] bg-slate-900 text-white relative overflow-hidden group/info">
                        <div className="relative z-10">
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-3">Order Placed On</p>
                          <div className="flex gap-2">
                            <Calendar size={16} className="text-emerald-400 shrink-0" />
                            <p className="text-xs font-bold leading-relaxed">
                               {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                               })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="relative z-10 pt-4 border-t border-white/10 flex justify-between items-center">
                           <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter opacity-60">
                             <CreditCard size={12} />
                             Online Payment
                           </div>
                           <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-tighter">
                             View Details <ChevronRight size={10} />
                           </div>
                        </div>

                        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl transition-all group-hover/info:bg-emerald-500/20" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}