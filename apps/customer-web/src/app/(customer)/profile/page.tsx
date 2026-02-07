"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, MapPin, Package, LogOut, ChevronRight, 
  Mail, Calendar, Edit3, ShieldCheck, CreditCard, Bell 
} from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-500 font-medium tracking-tight">Securing your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <Header />
      
      <main className="pb-24 pt-[120px] md:pt-[160px] px-4">
        <div className="mx-auto max-w-2xl">
          
          {/* Header Section */}
          <header className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Account</h1>
              <p className="text-slate-500 text-sm mt-1">Manage your personal information and settings</p>
            </div>
          </header>

          {/* Premium Profile Card */}
          <div className="relative bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-8">
            {/* Aesthetic Background Pattern */}
            <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500">
              <svg className="absolute inset-0 opacity-20 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
              </svg>
            </div>

            <div className="relative px-8 pb-8 pt-16">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div className="relative inline-block group">
                  {profile?.avatarUrl ? (
                    <img 
                      src={profile.avatarUrl} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-[2.5rem] border-4 border-white object-cover shadow-xl transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-emerald-50 rounded-[2.5rem] border-4 border-white flex items-center justify-center text-emerald-600 shadow-xl">
                      <User size={48} strokeWidth={1.5} />
                    </div>
                  )}
                  <Link 
                    href="/profile/edit"
                    className="absolute -bottom-1 -right-1 p-2.5 bg-white rounded-2xl shadow-lg border border-slate-100 text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95"
                  >
                    <Edit3 size={18} />
                  </Link>
                </div>

                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-slate-800">
                      {profile?.fullName || "Update Your Name"}
                    </h2>
                    {profile?.fullName && <ShieldCheck size={20} className="text-emerald-500" fill="currentColor" fillOpacity={0.2} />}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      <Mail size={14} />
                      <span className="text-xs font-medium">{profile?.email}</span>
                    </div>
                    {profile?.dob && (
                      <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <Calendar size={14} />
                        <span className="text-xs font-medium">{new Date(profile.dob).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats / Info Row */}
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-3xl">
                <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-slate-700 font-semibold italic text-sm">Official Member</p>
             </div>
             <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-3xl">
                <p className="text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">Account Status</p>
                <p className="text-slate-700 font-semibold text-sm">Verified Profile</p>
             </div>
          </div>

          {/* Main Action Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2 mb-2">Preferences</h3>
            
            <div className="grid gap-3">
              <MenuLink 
                href="/profile/edit" 
                icon={<User size={20} />} 
                iconBg="bg-emerald-50 text-emerald-600"
                label="Personal Details" 
                description="Update your identity and contact info"
              />
              <MenuLink 
                href="/profile/addresses" 
                icon={<MapPin size={20} />} 
                iconBg="bg-blue-50 text-blue-600"
                label="Delivery Addresses" 
                description="Manage your primary shipping locations"
              />
              <MenuLink 
                href="/orders" 
                icon={<Package size={20} />} 
                iconBg="bg-orange-50 text-orange-600"
                label="My Orders" 
                description="Check status and order history"
              />
            </div>

            <div className="pt-6">
              <button 
                onClick={() => logout()} 
                className="w-full flex items-center justify-between p-5 bg-white rounded-3xl border border-red-100 text-red-600 hover:bg-red-50 transition-all group active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 rounded-2xl group-hover:bg-red-100 transition-colors">
                    <LogOut size={22} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Sign Out</p>
                    <p className="text-xs text-red-400 font-medium">Securely end your session</p>
                  </div>
                </div>
                <ChevronRight size={18} className="opacity-40" />
              </button>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

interface MenuLinkProps {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description: string;
}

function MenuLink({ href, icon, iconBg, label, description }: MenuLinkProps) {
  return (
    <Link 
      href={href} 
      className="flex items-center justify-between p-4 bg-white rounded-3xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 ${iconBg} rounded-2xl transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        <div>
          <p className="font-bold text-slate-800 tracking-tight">{label}</p>
          <p className="text-xs text-slate-400 font-medium">{description}</p>
        </div>
      </div>
      <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-300 group-hover:text-emerald-500 transition-all">
        <ChevronRight size={18} strokeWidth={3} />
      </div>
    </Link>
  );
}