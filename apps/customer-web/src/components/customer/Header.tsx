"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ShinyText from '../styles/ShinyText'; 
import {
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Heart,
  Search,
  Package,
} from "lucide-react";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { useLogout } from "@/features/customer-auth/hooks/useLogout";
// ✅ IMPORT CART STORE (Adjust the path based on your actual file structure)
import { useCartStore } from "@/features/cart/cart.store"; 
import LocationSelector from "./LocationSelector";

export default function Header() {
  const { isAuthenticated } = useCustomerAuthStore();
  const logout = useLogout();
  const [scrolled, setScrolled] = useState(false);

  // ✅ REAL-TIME CART DATA
  const { items } = useCartStore();
  const cartItemCount = items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ UPDATED LOGIC: Corrected href for Categories to match your protected folder
  const baseLinks = [
    { name: "Home", href: "/home" },
    { name: "Menu", href: "/menu" },
    { name: "Categories", href: "/protected/category" }, 
  ];

  const navLinks = isAuthenticated 
    ? [...baseLinks, { name: "Orders", href: "/protected/my-orders" }]
    : baseLinks;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[1000] backdrop-blur-md transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] border-b border-white/30 flex flex-col
      ${scrolled ? "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] bg-white/92" : "bg-white/80"}`}
    >
      {/* TOP BAR */}
      <div 
        className={`bg-[linear-gradient(90deg,#166534,#22c55e,#166534)] bg-[length:200%_auto] animate-[shimmer_12s_linear_infinite] w-full flex justify-center transition-all duration-400 group/topbar
        ${scrolled ? "h-0 opacity-0 overflow-hidden" : "h-[36px] opacity-100"}`}
      >
        <div className="max-w-[1440px] w-full px-6 flex items-center text-white text-[0.8rem] font-semibold tracking-wide">
          <div className="overflow-hidden whitespace-nowrap relative flex-1 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="inline-block animate-[marquee_20s_linear_infinite] pl-full font-medium tracking-[0.5px] group-hover/topbar:[animation-play-state:paused]">
              🌱 Fresh, Hygienic and Natural Experience Purity. — <span className="opacity-80">Order Fresh Now!</span> &nbsp;&nbsp;&nbsp; 🥥 100% Natural Cane Juice &nbsp;&nbsp;&nbsp; ⚡ Delivery in 20 mins
            </div>
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <div className={`w-full transition-all duration-400 flex items-center ${scrolled ? "h-[70px]" : "h-[85px]"}`}>
        <div className="max-w-[1440px] mx-auto w-full h-full px-6 flex items-center justify-between gap-5">
          
          <div className="flex items-center gap-8">
            <Link href="/home" className="shrink-0 flex items-center transition-all duration-300 hover:scale-105 hover:-rotate-1 group">
              <Image 
                src="/images/4.png" 
                alt="Cane & Tender" 
                width={180} 
                height={65} 
                className={`object-contain transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:drop-shadow-[0_4px_6px_rgba(34,197,94,0.2)]
                ${scrolled ? "max-h-[50px]" : "max-h-[65px]"}`}
                priority 
                unoptimized={true} 
              />
            </Link>

            <nav className="flex items-center gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="relative px-3 py-2 text-[0.95rem] font-medium text-slate-600 transition-colors duration-300 hover:text-green-900 group/link"
                >
                  <ShinyText text={link.name} />
                  <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-green-500 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] -translate-x-1/2 rounded-full group-hover/link:w-[80%]" />
                </Link>
              ))}
            </nav>
          </div>

          {/* SEARCH SECTION */}
          <div className="flex-1 flex justify-center px-5">
            <div className="w-full max-w-[400px] bg-slate-100 rounded-2xl py-[10px] px-1 flex items-center border border-transparent transition-all duration-300 hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_2px_rgba(0,0,0,0.02)] hover:-translate-y-px focus-within:bg-white focus-within:border-green-500 focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.15),0_8px_20px_rgba(0,0,0,0.05)] focus-within:max-w-[450px] group/search">
              <Search 
                size={18} 
                className="ml-3.5 text-slate-400 transition-transform duration-300 group-focus-within/search:scale-110 group-focus-within/search:text-green-500"
              />
              <input 
                type="text" 
                placeholder="Search for fresh items..." 
                className="bg-transparent border-none outline-none text-[0.95rem] w-full text-slate-600 font-medium pl-3 placeholder:text-slate-400" 
              />
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-6">
            <div className="relative flex items-center pr-[10px] border-r border-slate-200 transition-transform duration-300 hover:-translate-y-px group/loc">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-[30px] shadow-[0_0_0_0_rgba(34,197,94,0.4)] animate-[pulse-ring_3s_infinite] opacity-0 group-hover/loc:opacity-100 -z-10" />
              <LocationSelector />
            </div>

            <div className="flex items-center gap-4">
              <Link href="/protected/favorites" className="w-[42px] h-[42px] flex items-center justify-center rounded-full text-slate-700 transition-all duration-300 cubic-bezier(0.175,0.885,0.32,1.275) hover:bg-green-50 hover:text-green-500 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(34,197,94,0.1)] group/fav">
                <Heart size={20} strokeWidth={2.5} className="group-hover/fav:animate-[heart-pop_0.4s_ease-in-out]" />
              </Link>
              
              <Link href="/protected/cart" className="w-[42px] h-[42px] flex items-center justify-center rounded-full text-slate-700 transition-all duration-300 cubic-bezier(0.175,0.885,0.32,1.275) hover:bg-green-50 hover:text-green-500 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(34,197,94,0.1)] group/cart">
                <div className="relative flex items-center">
                  <ShoppingCart size={20} strokeWidth={2.5} className="group-hover/cart:animate-bounce" />
                  {/* ✅ DYNAMIC CART BADGE */}
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-extrabold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white shadow-[0_2px_4px_rgba(249,115,22,0.3)] group-hover/cart:animate-[wiggle_1s_ease-in-out]">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              </Link>

              {isAuthenticated ? (
                <div className="relative group/user">
                  <div className="w-[42px] h-[42px] flex items-center justify-center rounded-full text-slate-700 transition-all duration-300 hover:bg-green-50 hover:text-green-500 hover:-translate-y-0.5 cursor-pointer">
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  
                  <div className="absolute top-[55px] right-0 w-[260px] bg-white/95 backdrop-blur-[20px] rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.05)] p-2.5 opacity-0 invisible translate-y-[15px] transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/user:opacity-100 group-hover/user:visible group-hover/user:translate-y-0 z-[1100]">
                    <div className="px-4 pt-4 pb-3">
                      <p className="m-0 text-base font-bold text-slate-900">Hello there! </p>
                      <p className="m-0 text-[0.8rem] text-slate-500">Welcome back</p>
                    </div>
                    <hr className="my-2 border-slate-200" />
                    <Link href="/protected/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 text-[0.875rem] transition-all duration-200 hover:bg-green-50 hover:text-green-500 hover:pl-5">
                      <User size={16} /> Profile
                    </Link>
                    <Link href="/protected/my-orders" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 text-[0.875rem] transition-all duration-200 hover:bg-green-50 hover:text-green-500 hover:pl-5">
                      <Package size={16} /> My Orders
                    </Link>
                    <Link href="/protected/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 text-[0.875rem] transition-all duration-200 hover:bg-green-50 hover:text-green-500 hover:pl-5">
                      <Settings size={16} /> Settings
                    </Link>
                    <hr className="my-2 border-slate-200" />
                    <button 
                      onClick={() => logout()} 
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-500 text-[0.875rem] transition-all duration-200 hover:bg-green-50 hover:pl-5 w-full text-left"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="bg-[linear-gradient(135deg,#22c55e_0%,#15803d_100%)] text-white px-6 py-2 rounded-full text-[0.9rem] font-semibold transition-all duration-300 shadow-[0_4px_10px_rgba(34,197,94,0.25)] flex items-center justify-center relative overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(34,197,94,0.4)] hover:bg-[linear-gradient(135deg,#16a34a_0%,#14532d_100%)] active:scale-95"
                >
                  <ShinyText text="Sign In" /> 
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.2); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        @keyframes heart-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
      `}</style>
    </header>
  );
}