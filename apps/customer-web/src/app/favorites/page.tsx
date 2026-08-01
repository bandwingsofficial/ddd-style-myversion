"use client";

import React from "react";
import Link from "next/link";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";

import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import ProductCard from "@/components/product/ProductCard";
import { useFavorites } from "@/providers/CustomerAuthProvider";

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="customer-page-shell customer-page-shell--with-cart flex-1">
        <div className="mobile-container">
          {favorites.length === 0 ? (
            <div className="flex min-h-[50vh] flex-col items-center justify-center py-12 text-center sm:min-h-[60vh]">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-red-100 opacity-50 blur-xl" />
                <div className="relative z-10 rounded-full bg-white p-6 shadow-sm">
                  <Heart size={48} className="text-slate-300" />
                </div>
              </div>

              <h2 className="mb-2 text-xl font-bold text-slate-800 sm:text-2xl">
                Your wishlist is empty
              </h2>
              <p className="mb-8 max-w-sm px-4 text-sm leading-relaxed text-slate-500 sm:text-base">
                Looks like you haven&apos;t added anything to your favorites yet.
                Explore our products and find something you love!
              </p>

              <Link
                href="/menu"
                className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-800 touch-target"
              >
                <ShoppingBag size={18} />
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              <header className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                    <Heart size={22} className="fill-red-500 text-red-500" />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold text-[#052e16] sm:text-2xl">
                      My Favorites
                    </h1>
                    <span className="text-sm font-medium text-slate-500">
                      {favorites.length} items
                    </span>
                  </div>
                </div>

                <Link
                  href="/menu"
                  className="inline-flex min-h-[2.75rem] items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-700 touch-target"
                >
                  <ArrowLeft size={16} />
                  Continue Shopping
                </Link>
              </header>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {favorites.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
