"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { useLogout } from "@/features/customer-auth/hooks/useLogout";
import { useCartStore } from "@/features/cart/cart.store";
import { useFavorites } from "@/providers/CustomerAuthProvider";
import LocationSelector from "./LocationSelector";
import { useHeaderOffset } from "@/hooks/useHeaderOffset";

export default function Header() {
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const { isLoggedIn } = useCustomerSession();
  const logout = useLogout();
  const [announcementHidden, setAnnouncementHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 

  const { items } = useCartStore();
  const { favorites } = useFavorites();
  const cartItemCount = items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistCount = favorites.length;

  useHeaderOffset(headerRef);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setAnnouncementHidden(scrollY > 10);
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const navLinks = isLoggedIn 
    ? [...baseLinks, { name: "Orders", href: "/orders" }] 
    : baseLinks;

  const submitSearch = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      router.push("/search");
      return;
    }
    router.push(`/menu?search=${encodeURIComponent(trimmed)}`);
    setMobileMenuOpen(false);
  }, [router]);

  return (
    <>
      <header 
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-[1000] flex flex-col border-b border-slate-200/80 bg-white/95 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] backdrop-blur-md"
        style={{ paddingTop: "var(--safe-top, env(safe-area-inset-top, 0px))" }}
      >
        {/* Announcement — hides on scroll down, returns at top */}
        <div 
          className={`w-full overflow-hidden transition-[height,opacity] duration-300 ease-out ${
            announcementHidden ? "h-0 opacity-0" : "h-9 opacity-100"
          }`}
          aria-hidden={announcementHidden}
        >
          <div className="flex h-9 w-full items-center justify-center bg-[linear-gradient(90deg,#166534,#22c55e,#166534)] bg-[length:200%_auto] animate-[shimmer_12s_linear_infinite]">
            <div className="max-w-[1440px] w-full px-4 md:px-6 flex items-center text-white text-[0.75rem] font-semibold tracking-wide">
              <div className="overflow-hidden whitespace-nowrap relative flex-1 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <div className="inline-block animate-[marquee_20s_linear_infinite] pl-full font-medium tracking-[0.5px]">
                  🌱 Fresh, Hygienic & Natural Experience.{" "}
                  <span className="opacity-80">Order Fresh Now!</span>
                  &nbsp;&nbsp;&nbsp; 🥥 Fresh Green Coconut Available
                  &nbsp;&nbsp;&nbsp; ⚡ Freshly Prepared & Delivered in 35 mins
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile location bar — ALWAYS visible, never collapses */}
        <div className="sm:hidden w-full border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-slate-100/60 px-3 py-2">
          <LocationSelector variant="mobile" />
        </div>

        {/* Main navigation — fixed height, no collapse */}
        <div className="flex h-[4.5rem] w-full items-center md:h-[5rem]">
          <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between gap-3 px-4 md:px-6">
            
            <div className="flex min-w-0 items-center gap-3 xl:gap-8">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-green-50 hover:text-green-600 lg:hidden touch-target"
                aria-label="Open Menu"
              >
                <Menu size={24} strokeWidth={2.5} />
              </button>

              <Link href="/home" className="group flex shrink-0 items-center transition-transform duration-200 hover:scale-[1.02]">
                <Image 
                  src="/images/Canten1.png" 
                  alt="Cane & Tender" 
                  width={140} 
                  height={50} 
                  className="h-10 w-auto max-h-10 object-contain sm:h-11 md:h-12 md:max-h-12"
                  priority 
                  unoptimized={true} 
                />
              </Link>

              <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className="relative px-3 py-2 text-[0.95rem] font-semibold text-slate-600 transition-colors duration-300 hover:text-green-900 group/link"
                  >
                    <ShinyText text={link.name} />
                    <span className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-green-500 transition-all duration-300 ease-out group-hover/link:w-[80%]" />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="hidden md:flex flex-1 justify-center max-w-[360px] lg:max-w-[400px]">
              <form
                className="group/search flex w-full items-center rounded-2xl border border-transparent bg-slate-100 px-2 py-2 transition-all duration-300 hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] focus-within:border-green-500 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitSearch(searchQuery);
                }}
              >
                <Search 
                  size={18} 
                  className="ml-2 text-slate-400 transition-transform duration-300 group-focus-within/search:scale-110 group-focus-within/search:text-green-500"
                />
                <input 
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search Products..." 
                  className="w-full border-none bg-transparent pl-2.5 text-[0.92rem] font-medium text-slate-600 outline-none placeholder:text-slate-400" 
                />
              </form>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
              <div className="relative hidden items-center border-r border-slate-200 pr-2 sm:flex">
                <LocationSelector variant="desktop" />
              </div>

              <div className="flex items-center gap-1 sm:gap-1.5">
                <Link href="/search" className="flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition-all duration-300 hover:bg-green-50 hover:text-green-500 md:hidden touch-target" aria-label="Search">
                  <Search size={20} strokeWidth={2.2} />
                </Link>

                <Link
                  href="/favorites"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition-all duration-300 hover:bg-green-50 hover:text-green-500 touch-target"
                  aria-label={
                    wishlistCount > 0
                      ? `Wishlist, ${wishlistCount} items`
                      : "Wishlist"
                  }
                >
                  <div className="relative flex items-center">
                    <Heart size={20} strokeWidth={2.2} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-0.5 text-[10px] font-extrabold text-white shadow-sm">
                        {wishlistCount > 99 ? "99+" : wishlistCount}
                      </span>
                    )}
                  </div>
                </Link>
                
                <Link href="/cart" className="flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition-all duration-300 hover:bg-green-50 hover:text-green-500 touch-target" aria-label="Cart">
                  <div className="relative flex items-center">
                    <ShoppingCart size={20} strokeWidth={2.2} />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-[17px] w-[17px] items-center justify-center rounded-full border-2 border-white bg-orange-500 text-[10px] font-extrabold text-white shadow-sm">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                </Link>

                <Link
                  href={isLoggedIn ? "/profile" : "/login"}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition-all duration-300 hover:bg-green-50 hover:text-green-500 lg:hidden touch-target"
                  aria-label="Profile"
                >
                  <User size={20} strokeWidth={2.2} />
                </Link>

                <div className="hidden lg:block">
                  {isLoggedIn ? (
                    <div className="group/user relative">
                      <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-700 transition-all duration-300 hover:bg-green-50 hover:text-green-500">
                        <User size={20} strokeWidth={2.2} />
                      </div>
                      
                      <div className="invisible absolute right-0 top-[50px] z-[1100] w-[250px] translate-y-[15px] rounded-2xl border border-slate-100 bg-white p-2 opacity-0 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] transition-all duration-250 ease-out group-hover/user:visible group-hover/user:translate-y-0 group-hover/user:opacity-100">
                        <div className="px-4 pb-2 pt-3">
                          <p className="m-0 text-sm font-bold text-slate-900">Hello there!</p>
                          <p className="m-0 text-[0.75rem] text-slate-500">Welcome back</p>
                        </div>
                        <hr className="my-1.5 border-slate-100" />
                        <Link href="/profile" className="flex items-center gap-3 rounded-lg px-4 py-2 text-[0.85rem] text-slate-600 transition-all hover:bg-green-50 hover:text-green-500">
                          <User size={15} /> Profile
                        </Link>
                        <Link href="/orders" className="flex items-center gap-3 rounded-lg px-4 py-2 text-[0.85rem] text-slate-600 transition-all hover:bg-green-50 hover:text-green-500">
                          <Package size={15} /> My Orders
                        </Link>
                        <hr className="my-1.5 border-slate-100" />
                        <button 
                          onClick={() => logout()} 
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-[0.85rem] text-red-500 transition-all hover:bg-red-50"
                        >
                          <LogOut size={15} /> Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link 
                      href="/login" 
                      className="flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#22c55e_0%,#15803d_100%)] px-5 py-2.5 text-[0.88rem] font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
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

      <div className={`fixed inset-0 z-[99999] h-screen w-screen transition-all duration-300 ease-in-out ${mobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 h-full w-full bg-slate-900/60 backdrop-blur-md" 
        />
        
        <div className={`fixed bottom-0 left-0 top-0 flex h-full w-[290px] max-w-[85vw] flex-col bg-white p-6 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="mb-6 flex items-center justify-between">
            <span className="text-lg font-bold text-green-900">Navigation</span>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-1.5 text-slate-500 transition-colors hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form
            className="mb-6 flex items-center rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 transition-all focus-within:border-green-500 focus-within:bg-white lg:hidden"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch(searchQuery);
            }}
          >
            <Search size={16} className="mr-2 text-slate-400" />
            <input 
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products..." 
              className="w-full border-none bg-transparent text-[0.9rem] font-medium text-slate-600 outline-none placeholder:text-slate-400" 
            />
          </form>

          <nav className="flex flex-1 flex-col gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-[0.95rem] font-semibold text-slate-700 transition-all hover:bg-green-50 hover:text-green-700"
              >
                {link.name}
              </Link>
            ))}

            {isLoggedIn && (
              <>
                <div className="my-3 h-px bg-slate-100" />
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[0.95rem] font-semibold text-slate-700 transition-all hover:bg-green-50 hover:text-green-700">
                  <User size={18} /> Profile
                </Link>
                <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[0.95rem] font-semibold text-slate-700 transition-all hover:bg-green-50 hover:text-green-700">
                  <Package size={18} /> My Orders
                </Link>
              </>
            )}
          </nav>

          <div className="border-t border-slate-100 pt-4">
            {isLoggedIn ? (
              <button 
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-500 transition-all hover:bg-red-50"
              >
                <LogOut size={18} /> Logout
              </button>
            ) : (
              <Link 
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#22c55e_0%,#15803d_100%)] py-3 font-semibold text-white shadow-md"
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
      `}</style>
    </>
  );
}
