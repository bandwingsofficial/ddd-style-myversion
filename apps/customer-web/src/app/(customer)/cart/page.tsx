"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { useCartStore } from "@/features/cart/cart.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import AddressSelectionModal from "@/components/address/AddressSelectionModal"; // ✅ Import Modal
import { Address } from "@/features/addresses/address.service";

// ... (Keep existing Helper Functions & Constants)
const BACKEND_URL = "https://api.dev.local:4000";
const getImageUrl = (path?: string) => {
  if (!path || path.trim() === "") return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_URL}${cleanPath}`;
};

export default function CartPage() {
  const router = useRouter();
  const { items, updateItem, removeItem, hydrated, loadCart } = useCartStore();
  const { isAuthenticated } = useCustomerAuthStore();
  
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false); // ✅ Modal State

  useEffect(() => {
    if (!hydrated) loadCart(isAuthenticated);
  }, [hydrated, isAuthenticated, loadCart]);

  // ... (Keep existing Calculations & Handlers for Quantity/Remove) ...
  const { subtotal, totalDiscount, grandTotal } = useMemo(() => {
    return items.reduce((acc, item) => {
        const price = item.discountPrice || item.unitPrice;
        acc.subtotal += item.unitPrice * item.quantity;
        acc.grandTotal += price * item.quantity;
        acc.totalDiscount += (item.unitPrice * item.quantity) - (price * item.quantity);
        return acc;
    }, { subtotal: 0, totalDiscount: 0, grandTotal: 0 });
  }, [items]);

  const handleQuantityChange = async (productId: string, currentQty: number, delta: number) => {
    // ... (Your existing code)
    if (isUpdating) return;
    const newQty = currentQty + delta;
    setIsUpdating(productId);
    try {
      if (newQty <= 0) await removeItem(productId, isAuthenticated);
      else await updateItem(productId, newQty, isAuthenticated);
    } finally { setIsUpdating(null); }
  };

  const handleRemove = async (productId: string) => {
    // ... (Your existing code)
    setIsUpdating(productId);
    await removeItem(productId, isAuthenticated);
    setIsUpdating(null);
  };

  // ✅ UPDATED CHECKOUT LOGIC
  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/cart");
      return;
    }
    // Open Modal to select address BEFORE going to checkout page
    setIsAddressModalOpen(true);
  };

  const handleAddressSelect = (address: Address) => {
    setIsAddressModalOpen(false);
    // Navigate to checkout with the address ID
    router.push(`/cart/checkout?addressId=${address.id}`);
  };

  if (!hydrated) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow pt-36 pb-12 px-4 sm:px-6">
        <section className="max-w-6xl mx-auto">
          {/* ... (Your existing Empty/Filled State Logic) ... */}
          
          {items.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Items List (Keep your existing map logic) */}
              <div className="lg:col-span-8 space-y-4">
                {items.map((item) => {
                   const imageUrl = getImageUrl(item.productImage);
                   const isDiscounted = item.discountPrice < item.unitPrice;
                   const isLoading = isUpdating === item.productId;
                   return (
                     <div key={item.productId} className={`group relative flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md ${isLoading ? 'opacity-70' : ''}`}>
                       {/* ... (Keep your existing Product Card UI) ... */}
                        <div className="w-full sm:w-28 h-28 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                          {imageUrl ? <img src={imageUrl} className="w-full h-full object-cover" /> : <ShoppingBag />}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                           {/* ... Title, Price, Controls ... */}
                           <div className="flex justify-between">
                              <h3 className="font-bold text-slate-800">{item.productName}</h3>
                              <button onClick={() => handleRemove(item.productId)}><Trash2 size={18} className="text-slate-400 hover:text-red-500" /></button>
                           </div>
                           <div className="flex items-center justify-between mt-2">
                              {/* Qty Controls */}
                              <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-lg border">
                                <button onClick={() => handleQuantityChange(item.productId, item.quantity, -1)} disabled={isLoading} className="p-1"><Minus size={14}/></button>
                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                <button onClick={() => handleQuantityChange(item.productId, item.quantity, 1)} disabled={isLoading} className="p-1"><Plus size={14}/></button>
                              </div>
                              <span className="font-extrabold">₹{item.discountPrice * item.quantity}</span>
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
                   {/* ... (Keep summary details) ... */}
                   <div className="flex justify-between items-end mb-6"><span className="font-bold">Total</span><span className="text-2xl font-extrabold">₹{grandTotal}</span></div>
                   
                   <button 
                    onClick={handleCheckoutClick} // ✅ Changed handler
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all"
                   >
                     Checkout <ArrowRight size={18} />
                   </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      
      {/* ✅ Add Modal Component */}
      <AddressSelectionModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSelect={handleAddressSelect} 
      />
      
      <Footer />
    </div>
  );
}