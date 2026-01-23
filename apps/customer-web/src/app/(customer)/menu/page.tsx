"use client";

import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { useProducts } from "@/features/products/hooks/useProducts";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";

export default function MenuPage() {
  const { products, loading } = useProducts();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content Padding:
        pt-[110px] matches your input. 
        If your header is covering content (like on the Contact page), 
        try increasing this to pt-[140px] or pt-[160px].
      */}
      <main className="pb-[60px] pt-[110px] md:pt-[140px]">
        <section className="mx-auto max-w-[1400px] px-4 md:px-6">
          
          {/* Page Header */}
          <header className="mb-8 border-b border-slate-100 pb-4">
            <h1 className="text-left text-[1.75rem] font-extrabold text-[#052e16] md:text-[2rem]">
              Our Menu
            </h1>
          </header>

          {/* Grid Layout */}
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[380px]:grid-cols-2 max-[379px]:grid-cols-1">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))
              : products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <div className="py-16 text-left text-slate-400">
              <p>No products found. Check back soon!</p>
            </div>
          )}
          
        </section>
      </main>

      <Footer />
    </div>
  );
}