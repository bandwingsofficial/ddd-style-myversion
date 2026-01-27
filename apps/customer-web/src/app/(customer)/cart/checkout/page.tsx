"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/features/cart/cart.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { AddressService, Address } from "@/features/addresses/address.service";
import { ArrowLeft, ShieldCheck, Loader2, ShoppingBag, MapPin } from "lucide-react";
import Header from "@/components/customer/Header";

// Helper for images
const BACKEND_URL = "https://api.dev.local:4000";
const getImageUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addressId = searchParams.get("addressId");

  const { items, checkoutCart, isCheckingOut } = useCartStore();
  const { isAuthenticated, isHydrated } = useCustomerAuthStore();
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // 1. Auth Guard
  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.replace("/login");
    if (isHydrated && isAuthenticated && items.length === 0) router.replace("/menu");
  }, [isHydrated, isAuthenticated, items, router]);

  // 2. Fetch Selected Address
  useEffect(() => {
    const fetchAddr = async () => {
      if (addressId) {
        setLoadingAddress(true);
        try {
          const addr = await AddressService.getOne(addressId);
          setSelectedAddress(addr);
        } catch (e) {
          console.error("Invalid address");
        } finally {
          setLoadingAddress(false);
        }
      }
    };
    fetchAddr();
  }, [addressId]);

  const totalAmount = items.reduce((sum, item) => sum + (item.discountPrice || item.unitPrice) * item.quantity, 0);

  const handleConfirmOrder = async () => {
    if (!addressId) {
      alert("Address missing. Please go back and select an address.");
      return;
    }
    
    // Pass addressId to checkout function
    const success = await checkoutCart(addressId);
    if (success) router.push("/orders/success");
    else alert("Order failed. Please try again.");
  };

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <Header />
      <main className="pt-36 pb-12 px-4 max-w-3xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-emerald-600 mb-6 transition-colors font-medium">
          <ArrowLeft size={18} className="mr-2" /> Back / Change Address
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-6">Final Review</h1>

        <div className="space-y-6">
          {/* Address Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <MapPin size={16} /> Delivering To
            </h2>
            {loadingAddress ? (
              <div className="h-10 bg-slate-100 animate-pulse rounded-md" />
            ) : selectedAddress ? (
              <div>
                <div className="text-lg font-bold text-slate-900">{selectedAddress.label}</div>
                <div className="text-slate-500">{selectedAddress.addressText}</div>
              </div>
            ) : (
              <div className="text-red-500">No Address Selected</div>
            )}
          </div>

          {/* Items Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
              <ShoppingBag size={16} /> Order Items
            </h2>
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.productId} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs">{item.quantity}x</span>
                    <span className="font-medium text-slate-700">{item.productName}</span>
                  </div>
                  <span className="font-bold text-slate-900">₹{(item.discountPrice || item.unitPrice) * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pay Button */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-600 font-medium">Grand Total</span>
              <span className="text-2xl font-extrabold text-slate-900">₹{totalAmount}</span>
            </div>
            <button 
              onClick={handleConfirmOrder}
              disabled={isCheckingOut || loadingAddress || !selectedAddress}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg"
            >
              {isCheckingOut ? <Loader2 className="animate-spin" size={24} /> : <><ShieldCheck size={24} /> Pay & Confirm Order</>}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}