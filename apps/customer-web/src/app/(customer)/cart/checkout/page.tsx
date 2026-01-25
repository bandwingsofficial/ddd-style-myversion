"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/features/cart/cart.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { ArrowLeft, ShieldCheck, Loader2, ShoppingBag } from "lucide-react";
import Header from "@/components/customer/Header";

// Helper for images (Optional: Keep if you use it, or remove if you have a utility)
const BACKEND_URL = "https://api.dev.local:4000";
const getImageUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, checkoutCart, isCheckingOut } = useCartStore();
  const { isAuthenticated, isHydrated } = useCustomerAuthStore();

  // =================================================
  // 1. AUTH & EMPTY CART GUARD
  // =================================================
  useEffect(() => {
    // Wait for hydration to finish before checking auth
    if (!isHydrated) return;

    // 🔒 If NOT Logged In -> Redirect to Login
    if (!isAuthenticated) {
      router.replace("/login?redirect=/cart/checkout");
      return;
    }

    // 🛒 If Cart is Empty -> Redirect to Menu
    if (items.length === 0) {
      router.replace("/menu");
    }
  }, [isHydrated, isAuthenticated, items.length, router]);

  // Prevent flash of content while checking auth
  if (!isHydrated || !isAuthenticated) return null;

  // =================================================
  // 2. LOGIC
  // =================================================
  const totalAmount = items.reduce((sum, item) => {
    return sum + (item.discountPrice || item.unitPrice) * item.quantity;
  }, 0);

  const handleConfirmOrder = async () => {
    const success = await checkoutCart();
    if (success) {
      // ✅ SUCCESS: Go to success page
      router.push("/orders/success");
    } else {
      // ❌ FAIL: Show error
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <Header />

      <main className="pt-36 pb-12 px-4 max-w-3xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-slate-500 hover:text-emerald-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Cart
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Review</h1>
        <p className="text-slate-500 mb-8">Please review your items before confirming.</p>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Order Items List */}
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag size={20} className="text-emerald-600" /> Items in your order
            </h2>
            
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                 const img = getImageUrl(item.productImage);
                 return (
                  <div key={item.productId} className="py-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                        {img ? (
                          <img src={img} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ShoppingBag size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{item.productName}</p>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">₹{(item.discountPrice || item.unitPrice) * item.quantity}</p>
                    </div>
                  </div>
                 );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 p-6 border-t border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-600 font-medium">Total Amount to Pay</span>
              <span className="text-2xl font-extrabold text-slate-900">₹{totalAmount}</span>
            </div>

            <button 
              onClick={handleConfirmOrder}
              disabled={isCheckingOut}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-lg"
            >
              {isCheckingOut ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <ShieldCheck size={24} /> Confirm & Place Order
                </>
              )}
            </button>
            <p className="text-xs text-center text-slate-400 mt-4">
              By confirming, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}