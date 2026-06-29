"use client";


import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ShinyText from '../styles/ShinyText';
import {
  ShoppingCart,
  User,
  LogOut,
  Heart,
  Search,
  Package,
  Menu,
  X,    
} from "lucide-react";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { useLogout } from "@/features/customer-auth/hooks/useLogout";
import { useCartStore } from "@/features/cart/cart.store";
import LocationSelector from "./LocationSelector";


export default function Header() {
  const { isAuthenticated } = useCustomerAuthStore();
  const logout = useLogout();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const { items } = useCartStore();
  const cartItemCount = items?.reduce((acc, item) => acc + item.quantity, 0) || 0;


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen]);


  const baseLinks = [
    { name: "Home", href: "/home" },
    { name: "Menu", href: "/menu" },
    { name: "Categories", href: "/category" },
  ];


  const navLinks = isAuthenticated
    ? [...baseLinks, { name: "Orders", href: "/orders" }]
    : baseLinks;


  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[1000] backdrop-blur-md transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] border-b border-white/30 flex flex-col
        ${scrolled ? "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] bg-white/95" : "bg-white/90"}`}
      >
        {/* TOP BAR */}
        <div
          className={`bg-[linear-gradient(90deg,#166534,#22c55e,#166534)] bg-[length:200%_auto] animate-[shimmer_12s_linear_infinite] w-full flex justify-center transition-all duration-400 group/topbar
          ${scrolled ? "h-0 opacity-0 overflow-hidden" : "h-[36px] opacity-100"}`}
        >
          <div className="max-w-[1440px] w-full px-4 md:px-6 flex items-center text-white text-[0.8rem] font-semibold tracking-wide">
            <div className="overflow-hidden whitespace-nowrap relative flex-1 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="inline-block animate-[marquee_20s_linear_infinite] pl-full font-medium tracking-[0.5px] group-hover/topbar:[animation-play-state:paused]">
                🌱 Fresh, Hygienic and Natural Experience Purity. — <span className="opacity-80">Order Fresh Now!</span> &nbsp;&nbsp;&nbsp; 🥥 100% Natural Cane Juice &nbsp;&nbsp;&nbsp; ⚡ Delivery in 20 mins
              </div>
            </div>
          </div>
        </div>


        {/* MAIN NAV */}
        <div className={`w-full transition-all duration-400 flex items-center ${scrolled ? "h-[65px]" : "h-[75px] md:h-[85px]"}`}>
          <div className="max-w-[1440px] mx-auto w-full h-full px-4 md:px-6 flex items-center justify-between gap-4">
           
            {/* LEFT: Logo & Navigation triggers */}
            <div className="flex items-center gap-4 xl:gap-8">
              {/* Hamburger Button (Triggers Mobile Menu Drawer) */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex lg:hidden p-2 text-slate-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-colors"
                aria-label="Open Menu"
              >
                <Menu size={24} strokeWidth={2.5} />
              </button>


              <Link href="/home" className="shrink-0 flex items-center transition-all duration-300 hover:scale-105 group">
                <Image
                  src="/images/4.png"
                  alt="Cane & Tender"
                  width={140}
                  height={50}
                  className={`object-contain transition-all duration-400 md:w-[170px]
                  ${scrolled ? "max-h-[45px]" : "max-h-[55px] md:max-h-[60px]"}`}
                  priority
                  unoptimized={true}
                />
              </Link>


              {/* Nav Links (Desktop Only) */}
              <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="relative px-3 py-2 text-[0.95rem] font-semibold text-slate-600 transition-colors duration-300 hover:text-green-900 group/link"
                  >
                    <ShinyText text={link.name} />
                    <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-green-500 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] -translate-x-1/2 rounded-full group-hover/link:w-[80%]" />
                  </Link>
                ))}
              </nav>
            </div>


            {/* MIDDLE: Search Section */}
            <div className="hidden md:flex flex-1 justify-center max-w-[360px] lg:max-w-[400px]">
              <div className="w-full bg-slate-100 rounded-2xl py-[8px] md:py-[10px] px-2 flex items-center border border-transparent transition-all duration-300 hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] focus-within:bg-white focus-within:border-green-500 focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.15)] group/search">
                <Search
                  size={18}
                  className="ml-2 text-slate-400 transition-transform duration-300 group-focus-within/search:scale-110 group-focus-within/search:text-green-500"
                />
                <input
                  type="text"
                  placeholder="Search Products..."
                  className="bg-transparent border-none outline-none text-[0.92rem] w-full text-slate-600 font-medium pl-2.5 placeholder:text-slate-400"
                />
              </div>
            </div>


            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-1 sm:gap-3 lg:gap-4">
              <div className="hidden sm:flex relative items-center pr-2 border-r border-slate-200">
                <LocationSelector />
              </div>


              <div className="flex items-center gap-1 md:gap-2">
                <Link href="/favorites" className="w-[40px] h-[40px] flex items-center justify-center rounded-full text-slate-700 transition-all duration-300 hover:bg-green-50 hover:text-green-500 group/fav">
                  <Heart size={20} strokeWidth={2.2} className="group-hover/fav:animate-[heart-pop_0.4s_ease-in-out]" />
                </Link>
               
                <Link href="/cart" className="w-[40px] h-[40px] flex items-center justify-center rounded-full text-slate-700 transition-all duration-300 hover:bg-green-50 hover:text-green-500 group/cart">
                  <div className="relative flex items-center">
                    <ShoppingCart size={20} strokeWidth={2.2} className="group-hover/cart:animate-bounce" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-extrabold w-[17px] h-[17px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                </Link>


                {/* User Dropdown (Desktop Only) */}
                <div className="hidden lg:block">
                  {isAuthenticated ? (
                    <div className="relative group/user">
                      <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full text-slate-700 transition-all duration-300 hover:bg-green-50 hover:text-green-500 cursor-pointer">
                        <User size={20} strokeWidth={2.2} />
                      </div>
                     
                      <div className="absolute top-[50px] right-0 w-[250px] bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.05)] p-2 opacity-0 invisible translate-y-[15px] transition-all duration-250 ease-out group-hover/user:opacity-100 group-hover/user:visible group-hover/user:translate-y-0 z-[1100]">
                        <div className="px-4 pt-3 pb-2">
                          <p className="m-0 text-sm font-bold text-slate-900">Hello there!</p>
                          <p className="m-0 text-[0.75rem] text-slate-500">Welcome back</p>
                        </div>
                        <hr className="my-1.5 border-slate-100" />
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 text-[0.85rem] hover:bg-green-50 hover:text-green-500 transition-all">
                          <User size={15} /> Profile
                        </Link>
                        <Link href="/orders" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 text-[0.85rem] hover:bg-green-50 hover:text-green-500 transition-all">
                          <Package size={15} /> My Orders
                        </Link>
                        <hr className="my-1.5 border-slate-100" />
                        <button
                          onClick={() => logout()}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 text-[0.85rem] hover:bg-red-50 transition-all w-full text-left"
                        >
                          <LogOut size={15} /> Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="bg-[linear-gradient(135deg,#22c55e_0%,#15803d_100%)] text-white px-5 py-2.5 rounded-full text-[0.88rem] font-bold transition-all duration-300 shadow-md flex items-center justify-center hover:-translate-y-0.5 active:scale-95"
                    >
                      <ShinyText text="Sign In" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>


      {/* --- MOBILE DRAWER SIDEBAR (EXTRACTED OUTSIDE HEADER TAG BOUNDS TO PREVENT UI CLIPPING) --- */}
      <div className={`fixed inset-0 w-screen h-screen transition-all duration-300 ease-in-out z-[99999]` } style={{ visibility: mobileMenuOpen ? "visible" : "hidden", opacity: mobileMenuOpen ? 1 : 0 }}>
        {/* Full-screen backdrop blur overlay */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md w-full h-full"
        />
       
        {/* Full-height Drawer container panel */}
        <div className={`fixed top-0 left-0 bottom-0 h-full w-[290px] max-w-[85vw] bg-white shadow-2xl p-6 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between mb-6">
            <span className="font-bold text-lg text-green-900">Navigation</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>


          {/* Mobile Search input */}
          <div className="lg:hidden mb-6 bg-slate-100 rounded-xl py-2 px-3 flex items-center border border-transparent focus-within:bg-white focus-within:border-green-500 transition-all">
            <Search size={16} className="text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-[0.9rem] w-full text-slate-600 placeholder:text-slate-400 font-medium"
            />
          </div>


          <nav className="flex flex-col gap-1 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-[0.95rem] font-semibold text-slate-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition-all"
              >
                {link.name}
              </Link>
            ))}


            {isAuthenticated && (
              <>
                <div className="h-px bg-slate-100 my-3" />
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-[0.95rem] font-semibold text-slate-700 hover:bg-green-50 hover:text-green-700 rounded-xl flex items-center gap-3">
                  <User size={18} /> Profile
                </Link>
                <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-[0.95rem] font-semibold text-slate-700 hover:bg-green-50 hover:text-green-700 rounded-xl flex items-center gap-3">
                  <Package size={18} /> My Orders
                </Link>
              </>
            )}
          </nav>


          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 font-semibold hover:bg-red-50 text-left transition-all"
              >
                <LogOut size={18} /> Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-[linear-gradient(135deg,#22c55e_0%,#15803d_100%)] text-white py-3 rounded-xl font-semibold flex items-center justify-center shadow-md"
              >
                Sign In
              </Link>
            )}
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
        @keyframes heart-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}

