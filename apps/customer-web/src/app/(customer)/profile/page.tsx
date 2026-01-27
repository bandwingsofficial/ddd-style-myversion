"use client";

import React from "react";
import Link from "next/link";
import { User, MapPin, Package, LogOut, ChevronRight } from "lucide-react";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { useLogout } from "@/features/customer-auth/hooks/useLogout";
import Header from "@/components/customer/Header"; // ✅ Added Header
import Footer from "@/components/customer/Footer"; // ✅ Added Footer

export default function ProfilePage() {
  // Use what IS available in your store to prevent crashes
  const { isAuthenticated, actorId } = useCustomerAuthStore();
  const logout = useLogout();

  // Fallback data
  const displayName = isAuthenticated ? "Valued Customer" : "Guest User";
  const displayContact = isAuthenticated && actorId ? `ID: ${actorId}` : "No contact info";

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header */}
      <Header />

      {/* 2. Main Content Wrapper (Matches MenuPage padding and layout) */}
      <main className="pb-[60px] pt-[110px] md:pt-[140px] bg-slate-50 min-h-screen">
        <section className="mx-auto max-w-md px-4">
          
          {/* Profile Header Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{displayName}</h1>
              <p className="text-sm text-slate-500">{displayContact}</p>
            </div>
          </div>

          {/* Menu Options Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            
            {/* Link to Address Manager */}
            <Link 
              href="/profile/addresses" 
              className="flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4 text-slate-700">
                <MapPin size={20} className="text-emerald-600" />
                <span className="font-semibold">Manage Addresses</span>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>

            {/* Link to Orders */}
            <Link 
              href="/orders" 
              className="flex items-center justify-between p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4 text-slate-700">
                <Package size={20} className="text-blue-600" />
                <span className="font-semibold">Your Orders</span>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>

            {/* Logout Button */}
            <button 
              onClick={() => logout()} 
              className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4 text-red-600">
                <LogOut size={20} />
                <span className="font-semibold">Logout</span>
              </div>
            </button>
          </div>

        </section>
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}