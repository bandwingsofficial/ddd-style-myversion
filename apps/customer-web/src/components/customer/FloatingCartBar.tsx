"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/features/cart/cart.store";
import { ShoppingBag, ArrowRight } from "lucide-react";

import { getProductImageUrl } from "@/lib/image-url";

export default function FloatingCartBar() {
  const pathname = usePathname();
  const { items, summary, hydrated } = useCartStore();

  // Hide the floating bar automatically if the user is already on the main cart page or checkout pages
  const isCartOrCheckout = pathname?.startsWith("/cart") || pathname?.startsWith("/checkout");

  const totalItems = summary.itemCount || items.reduce((acc, item) => acc + item.quantity, 0);
  const grandTotal = summary.grandTotal;

  // Do not render if not hydrated, cart is empty, or user is currently viewing the cart/checkout pages
  if (!hydrated || items.length === 0 || isCartOrCheckout) {
    return null;
  }

  // Grab up to 3 product images for a stacked preview effect
  const previewImages = items
    .slice(0, 3)
    .map((item) => getProductImageUrl(item.productImage))
    .filter(Boolean);

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center animate-fade-in-up">
      <div className="pointer-events-auto w-full max-w-2xl bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-4 transition-all duration-300 hover:border-emerald-500/50">
        
        {/* Left Section: Thumbnails & Item counts */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex -space-x-3 overflow-hidden p-1">
            {previewImages.length > 0 ? (
              previewImages.map((imgUrl, index) => (
                <div
                  key={index}
                  className="inline-block h-11 w-11 rounded-xl ring-2 ring-slate-900 bg-slate-800 overflow-hidden flex-shrink-0 shadow-md"
                >
                  <img
                    src={imgUrl as string}
                    alt="Cart item preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="h-11 w-11 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <ShoppingBag size={20} />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                {totalItems} {totalItems === 1 ? "Item" : "Items"}
              </span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="text-emerald-400 font-bold text-sm sm:text-base">
                ₹{grandTotal}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Extra charges & taxes calculated at checkout
            </p>
          </div>
        </div>

        {/* Right Section: View Cart / Action Button */}
        <Link
          href="/cart"
          className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all duration-200 text-sm sm:text-base flex-shrink-0"
        >
          <span>View Cart</span>
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
}