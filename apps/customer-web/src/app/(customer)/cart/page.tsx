"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { useCartStore } from "@/features/cart/cart.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  PackageX 
} from "lucide-react";
import AddressSelectionModal from "@/components/address/AddressSelectionModal";
import { Address } from "@/features/addresses/address.service";

// Helper for image URLs
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
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) loadCart(isAuthenticated);
  }, [hydrated, isAuthenticated, loadCart]);

  // Calculations
  const { subtotal, totalDiscount, grandTotal } = useMemo(() => {
    return items.reduce((acc, item) => {
        const price = item.discountPrice || item.unitPrice;
        acc.subtotal += item.unitPrice * item.quantity;
        acc.grandTotal += price * item.quantity;
        acc.totalDiscount += (item.unitPrice * item.quantity) - (price * item.quantity);
        return acc;
    }, { subtotal: 0, totalDiscount: 0, grandTotal: 0 });
  }, [items]);

  // Handlers
  const handleQuantityChange = async (productId: string, currentQty: number, delta: number) => {
    if (isUpdating) return;
    const newQty = currentQty + delta;
    setIsUpdating(productId);
    try {
      if (newQty <= 0) await removeItem(productId, isAuthenticated);
      else await updateItem(productId, newQty, isAuthenticated);
    } finally { setIsUpdating(null); }
  };

  const handleRemove = async (productId: string) => {
    setIsUpdating(productId);
    await removeItem(productId, isAuthenticated);
    setIsUpdating(null);
  };

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/cart");
      return;
    }
    setIsAddressModalOpen(true);
  };

  const handleAddressSelect = (address: Address) => {
    setIsAddressModalOpen(false);
    router.push(`/cart/checkout?addressId=${address.id}`);
  };

  if (!hydrated) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow pt-40 pb-12 px-4 sm:px-6">
        <section className="max-w-6xl mx-auto">
          
          {/* ✅ 1. Professional Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 pb-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight animate-shine">My Cart</h1>
                <p className="text-slate-500 mt-2 font-medium">
                    {items.length === 0 ? "Your cart is empty" : `You have ${items.length} ${items.length === 1 ? 'item' : 'items'} in your cart`}
                </p>
            </div>
            {items.length > 0 && (
                <Link href="/menu" className="hidden md:flex items-center text-emerald-600 font-bold hover:text-emerald-700 transition-colors bg-emerald-50 px-4 py-2 rounded-full">
                    <ArrowLeft size={18} className="mr-2" /> Continue Shopping
                </Link>
            )}
          </div>

          {/* Cart Content Logic */}
          {items.length === 0 ? (
            
            /* ✅ 2. Empty State Component (Fixes "nothing is shown") */
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <PackageX size={48} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">Your cart feels a bit light</h2>
                <p className="text-slate-500 max-w-md mb-8 px-4">
                    There is nothing in your bag. Let's add some fresh juices and tender coconut to make you happy!
                </p>
                <Link href="/menu" className="bg-emerald-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                    Start Shopping
                </Link>
            </div>

          ) : (

            /* ✅ 3. Existing Grid (Enhanced Container) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in-up">
              
              {/* Items List */}
              <div className="lg:col-span-8 space-y-4">
                {items.map((item) => {
                   const imageUrl = getImageUrl(item.productImage);
                   const isLoading = isUpdating === item.productId;
                   return (
                     <div key={item.productId} className={`group relative flex flex-col sm:flex-row gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                       
                       {/* Product Image */}
                       <div className="w-full sm:w-32 h-32 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 relative">
                         {imageUrl ? (
                            <img src={imageUrl} alt={item.productName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBag size={24} /></div>
                         )}
                       </div>

                       {/* Product Details */}
                       <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{item.productName}</h3>
                                <p className="text-sm text-slate-500 mt-1">Fresh & Natural</p>
                             </div>
                             <button onClick={() => handleRemove(item.productId)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 size={18} />
                             </button>
                          </div>

                          <div className="flex items-center justify-between mt-4 sm:mt-0">
                             {/* Qty Controls */}
                             <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                               <button 
                                 onClick={() => handleQuantityChange(item.productId, item.quantity, -1)} 
                                 className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-emerald-600 transition-colors disabled:opacity-50"
                                 disabled={isLoading}
                               >
                                 <Minus size={14}/>
                               </button>
                               <span className="text-sm font-bold w-8 text-center text-slate-900">{item.quantity}</span>
                               <button 
                                 onClick={() => handleQuantityChange(item.productId, item.quantity, 1)} 
                                 className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-emerald-600 transition-colors disabled:opacity-50"
                                 disabled={isLoading}
                               >
                                 <Plus size={14}/>
                               </button>
                             </div>
                             
                             <div className="text-right">
                                {item.discountPrice < item.unitPrice && (
                                    <span className="block text-xs text-slate-400 line-through">₹{item.unitPrice * item.quantity}</span>
                                )}
                                <span className="block text-lg font-extrabold text-slate-900">₹{item.discountPrice * item.quantity}</span>
                             </div>
                          </div>
                       </div>
                     </div>
                   );
                })}
              </div>

              {/* Summary Panel */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 lg:sticky lg:top-36">
                   <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>
                   
                   <div className="space-y-3 mb-6">
                       <div className="flex justify-between text-slate-500 text-sm">
                           <span>Subtotal</span>
                           <span>₹{subtotal}</span>
                       </div>
                       {totalDiscount > 0 && (
                           <div className="flex justify-between text-emerald-600 text-sm font-medium">
                               <span>Discount</span>
                               <span>-₹{totalDiscount}</span>
                           </div>
                       )}
                       <div className="flex justify-between text-slate-500 text-sm">
                           <span>Delivery Fee</span>
                           <span className="text-emerald-600 font-medium">30</span>
                       </div>
                   </div>

                   <div className="border-t border-slate-100 pt-4 mb-6">
                       <div className="flex justify-between items-end">
                           <span className="font-bold text-slate-900">Total Amount</span>
                           <span className="text-3xl font-extrabold text-slate-900">₹{grandTotal}</span>
                       </div>
                   </div>
                   
                   <button 
                    onClick={handleCheckoutClick}
                    className="w-full group flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                   >
                     <span>Proceed to Checkout</span>
                     <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                   
                   <p className="text-xs text-center text-slate-400 mt-4">
                       Safe & Secure Payment
                   </p>
                </div>
              </div>

            </div>
          )}
        </section>
      </main>
      
      <AddressSelectionModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSelect={handleAddressSelect} 
      />
      
      <Footer />
    </div>
  );
}