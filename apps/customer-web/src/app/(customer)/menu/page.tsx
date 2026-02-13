"use client";

import React, { useState, useMemo } from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { useProducts } from "@/features/products/hooks/useProducts";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import { Search, Filter, X } from "lucide-react";

export default function MenuPage() {
  const { products, loading } = useProducts();
  
  // --- Filter States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filterOptions = ["Organic", "Fresh", "Natural"];

  // --- Filter Logic ---
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      // 1. Search Filter
      const name = (product.name?.value || product.name || "").toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());

      // 2. Price Filter (using the logic from your ProductCard)
      const originalPrice = parseFloat(product.originalPrice ?? product.price?.originalPrice ?? product.price?.value ?? product.price ?? 0);
      const discountVal = parseFloat(product.discountPrice ?? product.salePrice ?? product.price?.discountPrice ?? product.price?.salePrice ?? 0);
      const currentPrice = (discountVal > 0 && discountVal < originalPrice) ? discountVal : originalPrice;
      const matchesPrice = currentPrice <= maxPrice;

      // 3. Tag Filter
      const productTags = (product.tags || []).map((t: string) => t.toLowerCase());
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => productTags.includes(tag.toLowerCase()));

      return matchesSearch && matchesPrice && matchesTags;
    });
  }, [products, searchQuery, maxPrice, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setMaxPrice(500);
    setSelectedTags([]);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pb-[60px] pt-[110px] md:pt-[140px]">
        <section className="mx-auto max-w-[1400px] px-4 md:px-6">
          
          {/* Page Header */}
          <header className="mb-8 border-b border-slate-100 pb-3">
            <h1 className="text-left text-[1.75rem] font-extrabold text-[#052e16] md:text-[2rem] animate-shine mb-6">
              Our Products
            </h1>

            {/* Filter Toolbar */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search fresh products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                />
              </div>

              {/* Price & Tags Wrapper */}
              <div className="flex flex-wrap items-center gap-4">
                
                {/* Price Slider */}
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 min-w-[200px]">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Max Price: ₹{maxPrice}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="500" 
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Tag Chips */}
                <div className="flex items-center gap-2">
                  {filterOptions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedTags.includes(tag)
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200"
                          : "bg-white text-slate-600 border-slate-200 hover:border-emerald-500"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Clear Filters */}
                {(searchQuery || selectedTags.length > 0 || maxPrice < 500) && (
                  <button 
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 px-2"
                  >
                    <X size={14} /> Reset
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Grid Layout */}
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5 min-[380px]:grid-cols-2 max-[379px]:grid-cols-1">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))
              : filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <Search size={40} className="text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">No products found</h3>
              <p className="text-slate-500 text-sm max-w-xs">
                We couldn't find any products matching your current filters. Try adjusting your search or price range.
              </p>
              <button 
                onClick={clearFilters}
                className="mt-6 text-emerald-600 font-bold text-sm underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}
          
        </section>
      </main>

      <Footer />
    </div>
  );
}