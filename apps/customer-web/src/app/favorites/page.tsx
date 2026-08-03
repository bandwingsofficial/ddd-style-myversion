"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ArrowLeft } from "lucide-react";

import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import ProductCard from "@/components/product/ProductCard";
import { useFavorites } from "@/providers/CustomerAuthProvider";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { typography, productGrid } from "@/lib/design-tokens";

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites } = useFavorites();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="customer-page-shell customer-page-shell--with-cart flex-1">
        <div className="mobile-container">
          <Breadcrumbs items={[{ label: "Wishlist" }]} />

          {favorites.length === 0 ? (
            <EmptyState
              icon={<Heart size={40} className="text-slate-300" />}
              title="Your wishlist is empty"
              description="Looks like you haven't added anything to your favorites yet. Explore our products and find something you love!"
              primaryAction={{
                label: "Start Shopping",
                onClick: () => router.push("/menu"),
              }}
            />
          ) : (
            <>
              <header className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                    <Heart size={22} className="fill-red-500 text-red-500" />
                  </div>
                  <div>
                    <h1 className={typography.pageTitle}>My Favorites</h1>
                    <span className="text-sm font-medium text-slate-500">
                      {favorites.length} items
                    </span>
                  </div>
                </div>

                <Button asChild variant="ghost" size="sm">
                  <Link href="/menu">
                    <ArrowLeft size={16} />
                    Continue Shopping
                  </Link>
                </Button>
              </header>

              <div className={productGrid.cols}>
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
