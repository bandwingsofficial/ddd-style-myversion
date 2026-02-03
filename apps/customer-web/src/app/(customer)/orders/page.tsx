"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckoutApi } from "@/features/checkout/checkout.api";
import { OrderDetails } from "@/features/checkout/checkout.types";
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Calendar, Loader2, MapPin, ShoppingBag } from "lucide-react";
import Header from "@/components/customer/Header";

// Helper for backend images
const BACKEND_URL = "https://api.dev.local:4000";
const getImageUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

// Helper for status badge
const getStatusBadge = (status: string) => {
  switch (status) {
    case "PAID": 
    case "Delivered":
      return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Confirmed</span>;
    case "PAYMENT_PENDING": 
      return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12}/> Pending</span>;
    case "FAILED": 
    case "CANCELLED":
      return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12}/> Failed</span>;
    default: 
      return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDetails[]>([]);
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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <Header />
      
      <main className="pt-36 pb-12 px-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
          <Package className="text-emerald-600" /> My Orders
        </h1>
        <p className="text-slate-500 mb-8 ml-1">Track your past orders and status.</p>

        {orders.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} className="text-emerald-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">No orders placed yet</h2>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Looks like you haven't ordered anything from us yet.</p>
            <Link href="/menu" className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20">
              Explore Menu
            </Link>
          </div>
        ) : (
          /* ORDERS LIST */
          <div className="space-y-5">
            {orders.map((order) => (
              <Link 
                href={`/orders/${order.id}`} // Links to your detail page
                key={order.id} 
                className="block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group relative overflow-hidden"
              >
                {/* Decorative status bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${order.status === 'PAID' || order.status === 'Delivered' ? 'bg-emerald-500' : 'bg-slate-300'}`} />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pl-2">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-slate-900 text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-4 text-slate-500 text-xs font-medium uppercase tracking-wide">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(order.createdAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-emerald-600 transition-colors hidden sm:block" />
                </div>

                {/* Items Preview */}
                <div className="bg-slate-50 rounded-xl p-4 mb-4 pl-4 ml-2">
                  <div className="space-y-3">
                    {order.items.slice(0, 2).map((item: any) => { 
                      const img = getImageUrl(item.productImage);
                      return (
                        <div key={item.productId || item.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                            {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="m-auto text-slate-300" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{item.productName}</p>
                            <p className="text-xs text-slate-500">{item.quantity} x ₹{item.unitPrice}</p>
                          </div>
                          {/* Use totalPrice for Orders, lineTotal for Cart */}
                          <span className="text-sm font-bold text-slate-900">₹{item.totalPrice}</span>
                        </div>
                      );
                    })}
                    {order.items.length > 2 && (
                      <p className="text-xs text-slate-400 font-medium pt-1">+ {order.items.length - 2} more items...</p>
                    )}
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex justify-between items-center pl-2">
                  <div className="flex items-center gap-2 text-slate-500 text-sm max-w-[60%]">
                    <MapPin size={14} className="flex-shrink-0 text-emerald-600" />
                    <span className="truncate">{order.address.addressText}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs text-slate-400 font-bold uppercase">Total Amount</span>
                    <span className="text-xl font-extrabold text-slate-900">₹{order.grandTotal}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}