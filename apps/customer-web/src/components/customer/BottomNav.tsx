"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";

import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home, match: (path: string) => path === "/home" || path === "/" },
  { href: "/category", label: "Categories", icon: LayoutGrid, match: (path: string) => path.startsWith("/category") },
  { href: "/search", label: "Search", icon: Search, match: (path: string) => path.startsWith("/search") || path.startsWith("/menu") },
  { href: "/orders", label: "Orders", icon: ShoppingBag, match: (path: string) => path.startsWith("/orders"), auth: true },
  { href: "/profile", label: "Profile", icon: User, match: (path: string) => path.startsWith("/profile") || path.startsWith("/login"), auth: false },
];

const HIDDEN_PREFIXES = [
  "/login",
  "/verify-otp",
  "/cart",
  "/payment",
];

export default function BottomNav() {
  const pathname = usePathname() ?? "";
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);

  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (hidden) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[900] border-t border-slate-200/80 bg-white/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary mobile navigation"
    >
      <div className="mx-auto flex h-[4.25rem] max-w-lg items-stretch justify-around px-1 shadow-[0_-8px_30px_rgba(15,23,42,0.06)]">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          const href =
            item.auth && !isAuthenticated && item.href === "/orders"
              ? "/login?redirect=/orders"
              : item.href === "/profile" && !isAuthenticated
                ? "/login?redirect=/profile"
                : item.href;

          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold transition-all touch-target ${
                active
                  ? "text-emerald-700"
                  : "text-slate-500 hover:text-emerald-600"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-all ${
                  active
                    ? "bg-emerald-100 text-emerald-700 shadow-sm"
                    : "bg-transparent"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
