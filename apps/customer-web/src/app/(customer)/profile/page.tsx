"use client";


import React, { useState, useEffect, useCallback } from "react";
import { User, MapPin, Package, LogOut, ChevronRight, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


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


  const getTabLabel = () => {
    if (activeTab === 'profile') return "Personal Details";
    if (activeTab === 'addresses') return "Saved Addresses";
    return "My Orders";
  };


  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
     
      <main className="max-w-7xl mx-auto pb-24 pt-[130px] md:pt-[140px] px-4">
       
        {/* MOBILE CONTROLLER BUTTON (Visible only on mobile/tablet viewport weights) */}
        <div className="block md:hidden mb-5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <User size={20} />
              </div>
              <div className="text-left">
                <span className="text-[0.68rem] uppercase tracking-wider font-extrabold text-slate-400 block leading-none mb-1">Current Section</span>
                <span className="font-extrabold text-slate-800 text-sm">{getTabLabel()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600">
              <Menu size={14} className="text-emerald-600" />
              <span>Options</span>
            </div>
          </button>
        </div>


        {/* MOBILE OVERLAY NAVIGATION DRAWER */}
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] transition-opacity duration-300 md:hidden"
          style={{ opacity: mobileMenuOpen ? 1 : 0, pointerEvents: mobileMenuOpen ? "auto" : "none" }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-0 bottom-0 left-0 w-[300px] max-w-[85vw] bg-white h-full p-6 flex flex-col shadow-2xl transition-transform duration-300 ease-out"
            style={{ transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <User size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[0.65rem] text-slate-400 font-extrabold uppercase tracking-wider leading-none mb-1">Account</p>
                  <p className="font-extrabold text-slate-800 text-sm truncate max-w-[140px]">{profile?.fullName || "User"}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 active:scale-90 transition-all"
              >
                <X size={16} />
              </button>
            </div>


            <nav className="space-y-2 flex-1">
              <SidebarItem
                icon={<User size={18} />}
                label="Personal Details"
                active={activeTab === 'profile'}
                onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
              />
              <SidebarItem
                icon={<MapPin size={18} />}
                label="Saved Addresses"
                active={activeTab === 'addresses'}
                onClick={() => { setActiveTab('addresses'); setMobileMenuOpen(false); }}
              />
              <SidebarItem
                icon={<Package size={18} />}
                label="My Orders"
                active={activeTab === 'orders'}
                onClick={() => { window.location.href = '/orders'; setMobileMenuOpen(false); }}
              />
              <hr className="my-4 border-slate-100" />
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-bold text-sm"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </nav>
          </div>
        </div>


        <div className="flex flex-col md:flex-row gap-8">
         
          {/* SIDEBAR (Hidden on mobile viewports, intact on desktop layout) */}
          <aside className="hidden md:block w-full md:w-80 shrink-0">
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

