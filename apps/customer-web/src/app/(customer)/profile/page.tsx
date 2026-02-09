"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User, MapPin, Package, LogOut, ChevronRight } from "lucide-react";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { useLogout } from "@/features/customer-auth/hooks/useLogout";
import { profileApi } from "@/features/customer-profile/api/profile.api";
import { ProfileData } from "@/features/customer-profile/types/profile.types";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

// Sub-components for views
import PersonalDetailsView from "./PersonalDetailsView";
import AddressesView from "./addresses/page";

export default function ProfilePage() {
  const { isAuthenticated, isHydrated } = useCustomerAuthStore();
  const logout = useLogout();
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'addresses' | 'orders'
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoized fetch function so it can be called after updates
  const fetchProfile = useCallback(async () => {
    try {
      const res = await profileApi.getProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  if (!isHydrated || loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      
      <main className="max-w-7xl mx-auto pb-24 pt-[120px] px-4">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR */}
          <aside className="w-full md:w-80 shrink-0">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 sticky top-40">
              <div className="flex items-center gap-4 mb-8 px-2">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Account</p>
                  <p className="font-bold text-slate-800 truncate w-32">{profile?.fullName || "User"}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <SidebarItem 
                  icon={<User size={20} />} 
                  label="Personal Details" 
                  active={activeTab === 'profile'} 
                  onClick={() => setActiveTab('profile')}
                />
                <SidebarItem 
                  icon={<MapPin size={20} />} 
                  label="Saved Addresses" 
                  active={activeTab === 'addresses'} 
                  onClick={() => setActiveTab('addresses')}
                />
                <SidebarItem 
                  icon={<Package size={20} />} 
                  label="My Orders" 
                  active={activeTab === 'orders'} 
                  onClick={() => window.location.href = '/orders'} 
                />
                <hr className="my-4 border-slate-50" />
                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-semibold"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <section className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <PersonalDetailsView 
                profile={profile} 
                onProfileUpdate={fetchProfile} 
              />
            )}
            {activeTab === 'addresses' && <AddressesView />}
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
        active 
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-bold text-sm">{label}</span>
      </div>
      <ChevronRight size={16} className={active ? "opacity-100" : "opacity-0"} />
    </button>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  );
}