"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ShoppingBag, X } from "lucide-react";

import { useCartStore } from "@/features/cart/cart.store";
import { getProductImageUrl } from "@/lib/image-url";

const HIDDEN_ROUTE_PREFIXES = [
  "/cart",
  "/payment",
];

function isHiddenRoute(pathname: string) {
  return HIDDEN_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function buildCartSignature(
  items: Array<{ productId: string; quantity: number }>,
  itemCount: number,
  grandTotal: number,
) {
  const itemKey = items
    .map((item) => `${item.productId}:${item.quantity}`)
    .sort()
    .join("|");
  return `${itemKey}::${itemCount}::${grandTotal}`;
}

export default function FloatingCartBar() {
  const pathname = usePathname() ?? "";
  const { items, summary, hydrated } = useCartStore();

  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const dismissedSignatureRef = useRef<string | null>(null);

  const totalItems =
    summary.itemCount || items.reduce((acc, item) => acc + item.quantity, 0);
  const grandTotal = summary.grandTotal;

  const cartSignature = useMemo(
    () => buildCartSignature(items, totalItems, grandTotal),
    [items, totalItems, grandTotal],
  );

  useEffect(() => {
    if (
      dismissedSignatureRef.current !== null &&
      cartSignature !== dismissedSignatureRef.current
    ) {
      setIsVisible(true);
      setIsClosing(false);
      dismissedSignatureRef.current = null;
    }
  }, [cartSignature]);

  useEffect(() => {
    if (items.length === 0) {
      setIsVisible(true);
      setIsClosing(false);
      dismissedSignatureRef.current = null;
    }
  }, [items.length]);

  const handleClose = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dismissedSignatureRef.current = cartSignature;
    setIsClosing(true);
    window.setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 280);
  };

  if (
    !hydrated ||
    items.length === 0 ||
    isHiddenRoute(pathname) ||
    !isVisible
  ) {
    return null;
  }

  const previewImages = items
    .slice(0, 3)
    .map((item) => getProductImageUrl(item.productImage))
    .filter(Boolean);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[850] flex justify-center px-3 sm:px-4 lg:bottom-6"
      style={{
        bottom:
          "calc(var(--customer-bottom-nav-offset) + var(--safe-bottom) + var(--customer-floating-cart-gap))",
      }}
    >
      <div
        className={`pointer-events-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/90 text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl ${
          isClosing ? "animate-floating-cart-out" : "animate-floating-cart-in"
        }`}
      >
        <div className="flex h-[60px] max-h-[64px] items-center gap-2 px-3 sm:gap-3 sm:px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
            <div className="relative flex flex-shrink-0 -space-x-2 overflow-hidden">
              {previewImages.length > 0 ? (
                previewImages.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="inline-block h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800 ring-2 ring-slate-900 sm:h-9 sm:w-9"
                  >
                    <img
                      src={imgUrl as string}
                      alt="Cart item preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 sm:h-9 sm:w-9">
                  <ShoppingBag size={16} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                <span className="truncate text-sm font-extrabold tracking-wide">
                  {totalItems} {totalItems === 1 ? "Item" : "Items"}
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  ₹{grandTotal}
                </span>
              </div>
              <p className="truncate text-[10px] leading-tight text-slate-400">
                Taxes & delivery
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1.5">
            <Link
              href="/cart"
              className="group flex h-9 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 active:scale-[0.98] sm:gap-1.5 sm:px-3 sm:text-sm"
            >
              <span>View Cart</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4"
              />
            </Link>

            <button
              type="button"
              onClick={handleClose}
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border border-white/25 bg-transparent text-white/80 transition hover:border-white/40 hover:bg-white/10 hover:text-white active:scale-95"
              aria-label="Hide cart bar"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
