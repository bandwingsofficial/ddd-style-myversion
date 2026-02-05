"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, Package, LogOut, ChevronRight, Mail, Calendar, Edit3 } from "lucide-react";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { useLogout } from "@/features/customer-auth/hooks/useLogout";
import { profileApi } from "@/features/customer-profile/api/profile.api";
import { ProfileData } from "@/features/customer-profile/types/profile.types";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useCustomerAuthStore();
  const logout = useLogout();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/");
    }

    if (isAuthenticated) {
      profileApi.getProfile()
        .then((res) => {
          if (res.success) setProfile(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-emerald-200 rounded-full mb-4"></div>
          <p className="text-slate-400 font-medium">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pb-24 pt-[110px] md:pt-[140px] px-4">
        <section className="mx-auto max-w-md">
          
          {/* Advanced Profile Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4">
                {profile?.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 bg-emerald-100 rounded-2xl border-4 border-white flex items-center justify-center text-emerald-600 shadow-md">
                    <User size={40} />
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-600 hover:text-emerald-600 transition-colors">
                  <Edit3 size={16} />
                </button>
              </div>

              <h1 className="text-2xl font-bold text-slate-800">
                {profile?.fullName || "Complete Your Profile"}
              </h1>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-sm">{profile?.email || "No email provided"}</span>
                </div>
                {profile?.dob && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="text-sm">{new Date(profile.dob).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Menu */}
          <div className="grid gap-3">
            <MenuLink 
              href="/profile/edit" 
              icon={<User className="text-emerald-600" />} 
              label="Account Settings" 
              description="Update name, email, and preferences"
            />
            <MenuLink 
              href="/profile/addresses" 
              icon={<MapPin className="text-blue-600" />} 
              label="Saved Addresses" 
              description="Manage delivery locations"
            />
            <MenuLink 
              href="/orders" 
              icon={<Package className="text-orange-600" />} 
              label="Order History" 
              description="View and track your orders"
            />
            
            <button 
              onClick={() => logout()} 
              className="w-full mt-4 flex items-center gap-4 p-5 bg-red-50 rounded-2xl text-red-600 hover:bg-red-100 transition-all group"
            >
              <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
              <span className="font-bold">Logout</span>
            </button>
          </div>

        </section>
      </main>
      <Footer />
    </div>
  );
}

// Reusable Menu Component for cleaner code
function MenuLink({ href, icon, label, description }: { href: string, icon: React.ReactNode, label: string, description: string }) {
  return (
    <a href={href} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
          {icon}
        </div>
        <div>
          <p className="font-bold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
    </a>
  );
}