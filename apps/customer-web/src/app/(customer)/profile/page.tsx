"use client";

import React, { useEffect } from "react"; // Removed useState as we use the store's state now
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, MapPin, Package, LogOut, ChevronRight } from "lucide-react";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { useLogout } from "@/features/customer-auth/hooks/useLogout";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

export default function ProfilePage() {
  const router = useRouter();
  
  // ✅ Get isHydrated from the store
  const { isAuthenticated, isHydrated, actorId } = useCustomerAuthStore();
  const logout = useLogout();

  useEffect(() => {
    // ✅ ONLY redirect if:
    // 1. The store has finished loading (isHydrated is true)
    // 2. AND the user is NOT authenticated
    if (isHydrated && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isHydrated, router]);

  // ✅ Show nothing (or a loading spinner) while checking local storage
  if (!isHydrated) {
    return null; // Or return <div className="p-10 text-center">Loading...</div>
  }

  // ✅ Prevent flash of content if we are about to redirect
  if (!isAuthenticated) {
    return null; 
  }

  const displayName = "Valued Customer";
  const displayContact = actorId ? `ID: ${actorId}` : "No contact info";

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pb-[60px] pt-[110px] md:pt-[140px] bg-slate-50 min-h-screen">
        <section className="mx-auto max-w-md px-4">
          
          {/* Profile Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{displayName}</h1>
              <p className="text-sm text-slate-500">{displayContact}</p>
            </div>
          </div>

          {/* Menu Options */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <Link href="/profile/addresses" className="flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 text-slate-700">
                <MapPin size={20} className="text-emerald-600" />
                <span className="font-semibold">Manage Addresses</span>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>

            <Link href="/orders" className="flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 text-slate-700">
                <Package size={20} className="text-blue-600" />
                <span className="font-semibold">Your Orders</span>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>

            <button onClick={() => logout()} className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors text-left">
              <div className="flex items-center gap-4 text-red-600">
                <LogOut size={20} />
                <span className="font-semibold">Logout</span>
              </div>
            </button>
          </div>

        </section>
      </main>
      <Footer />
    </div>
  );
}