"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { useCartStore } from "@/features/cart/cart.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

// Backend URL configuration
const BACKEND_URL = "https://api.dev.local:4000";

const getImageUrl = (path?: string) => {
  if (!path || path.trim() === "") return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
};

export default function CartPage() {
  const router = useRouter();
  
  // Stores
  const { items, updateItem, removeItem, hydrated, loadCart } = useCartStore();
  const { isAuthenticated } = useCustomerAuthStore();
  
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Initial Load (Sync cart when Auth status changes)
  useEffect(() => {
    if (!hydrated) {
      loadCart(isAuthenticated);
    }
  }, [hydrated, isAuthenticated, loadCart]);

  // Calculations
  const { subtotal, totalDiscount, grandTotal } = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const price = item.discountPrice || item.unitPrice;
        const lineTotal = price * item.quantity;
        const originalLineTotal = item.unitPrice * item.quantity;
        
        acc.subtotal += originalLineTotal;
        acc.grandTotal += lineTotal;
        acc.totalDiscount += (originalLineTotal - lineTotal);
        return acc;
      },
      { subtotal: 0, totalDiscount: 0, grandTotal: 0 }
    );
  }, [items]);

  // Handlers
  const handleQuantityChange = async (productId: string, currentQty: number, delta: number) => {
    if (isUpdating) return;
    const newQty = currentQty + delta;
    
    setIsUpdating(productId);
    try {
      if (newQty <= 0) {
        await removeItem(productId, isAuthenticated);
      } else {
        await updateItem(productId, newQty, isAuthenticated);
      }
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setIsUpdating(productId);
    await removeItem(productId, isAuthenticated);
    setIsUpdating(null);
  };

  // ✅ LOGIC: Guest -> Login, Auth -> Checkout
  const handleCheckout = () => {
    if (isAuthenticated) {
      router.push("/cart/checkout");
    } else {
      router.push("/login?redirect=/cart/checkout");
    }
  };

  if (!hydrated) {
     return (
       <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
         <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow pt-36 pb-12 px-4 sm:px-6">
        <section className="max-w-6xl mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              Your Cart 
              {items.length > 0 && (
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  {items.length} items
                </span>
              )}
            </h1>
          </div>

          {items.length === 0 ? (
            /* --- EMPTY STATE --- */
            <div className="max-w-md mx-auto mt-6 flex flex-col items-center justify-center py-16 px-6 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-9 h-9 text-emerald-600/60" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Looks like you haven't added any products yet.
              </p>
              
              <Link 
                href="/menu" 
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-0.5"
              >
                <ArrowLeft size={18} />
                Browse Menu
              </Link>
            </div>
          ) : (
            /* --- FILLED STATE --- */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Items List */}
              <div className="lg:col-span-8 space-y-4">
                {items.map((item) => {
                  const imageUrl = getImageUrl(item.productImage);
                  const isDiscounted = item.discountPrice < item.unitPrice;
                  const isLoading = isUpdating === item.productId;
                  
                  return (
                    <div key={item.productId} className={`group relative flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-emerald-100 ${isLoading ? 'opacity-70' : ''}`}>
                      {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-2xl">
                          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                        </div>
                      )}

                      <div className="w-full sm:w-28 h-28 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={24} /></div>
                          )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{item.productName}</h3>
                            <div className="text-sm font-medium text-slate-500">
                              <span className="text-slate-900">₹{item.discountPrice}</span>
                              {isDiscounted && <span className="ml-2 text-xs line-through text-slate-400">₹{item.unitPrice}</span>}
                            </div>
                          </div>
                          <button onClick={() => handleRemove(item.productId)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="flex items-end justify-between mt-4 sm:mt-0">
                          <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-lg border border-slate-200">
                            <button className="w-8 h-8 flex items-center justify-center bg-white text-slate-600 rounded-md shadow-sm hover:text-emerald-600 border border-transparent" onClick={() => handleQuantityChange(item.productId, item.quantity, -1)} disabled={isLoading || item.quantity <= 0}>
                              <Minus size={14} strokeWidth={2.5} />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-slate-900 tabular-nums">{item.quantity}</span>
                            <button className="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-md shadow-sm hover:bg-emerald-700" onClick={() => handleQuantityChange(item.productId, item.quantity, 1)} disabled={isLoading}>
                              <Plus size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                          <div className="text-right">
                             <span className="text-lg font-extrabold text-slate-900">₹{item.discountPrice * item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Panel */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:sticky lg:top-36">
                   <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
                   <div className="space-y-3 mb-6">
                     <div className="flex justify-between text-slate-500 text-sm"><span>Subtotal</span><span className="font-semibold text-slate-900">₹{subtotal}</span></div>
                     {totalDiscount > 0 && <div className="flex justify-between text-emerald-600 text-sm"><span>Savings</span><span className="font-semibold">- ₹{totalDiscount}</span></div>}
                     <div className="h-px bg-slate-100 my-4" />
                     <div className="flex justify-between items-end"><span className="text-base font-bold text-slate-800">Total</span><span className="text-2xl font-extrabold text-slate-900">₹{grandTotal}</span></div>
                   </div>
                   
                   <button 
                    onClick={handleCheckout} 
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                   >
                     Checkout <ArrowRight size={18} />
                   </button>
                   <p className="text-[10px] text-slate-400 text-center mt-4">Shipping & taxes calculated at next step</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}