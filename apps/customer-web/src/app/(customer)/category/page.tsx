"use client";

import React, { useMemo, useState } from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { Search, Leaf, Droplets, Coffee, Utensils, ShoppingBag, ArrowRight } from "lucide-react";

const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  const iconProps = { size: 32, color: "#166534" }; 
  if (lowerName.includes("cane") || lowerName.includes("juice")) return <Leaf {...iconProps} />;
  if (lowerName.includes("coconut") || lowerName.includes("water")) return <Droplets {...iconProps} />;
  if (lowerName.includes("tea") || lowerName.includes("coffee")) return <Coffee {...iconProps} />;
  if (lowerName.includes("food") || lowerName.includes("snack")) return <Utensils {...iconProps} />;
  return <ShoppingBag {...iconProps} />;
};

export default function CategoriesPage() {
  const { categories, isLoading } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories]
      .filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, searchQuery]);

  const getImageUrl = (path: string) => {
    if (!path) return "";
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
    return `${baseUrl}/${path.replace(/^\//, "")}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
      <Header />

      <style jsx>{`
        .hero-gradient {
          background: radial-gradient(circle at top right, #f4fbf7 0%, transparent 35%),
                      radial-gradient(circle at bottom left, #f4fbf7 0%, transparent 35%);
        }
        .category-card {
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .category-card:hover {
          transform: translateY(-5px);
        }
        .img-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.04);
          transition: all 0.2s ease;
        }
        .category-card:hover .img-wrapper::after {
          box-shadow: inset 0 0 0 2.5px #22c55e;
        }
      `}</style>

      <main className="pt-40 pb-16 hero-gradient flex-grow">
        {/* Simplified Hero Section */}
        <section className="max-w-6xl mx-auto px-4 pt-6 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800 mb-1">
                Explore <span className="text-green-700">Our Collections</span>
              </h1>
              <p className="text-slate-500 text-sm">
                Discover our hand-picked categories of 100% natural juices and farm-fresh snacks.
              </p>
            </div>

            {/* Compact Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm shadow-sm focus:ring-2 focus:ring-green-500/10 focus:border-green-600 transition-all outline-none"
              />
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-6xl mx-auto px-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
              <p className="mt-3 text-slate-400 text-sm font-medium">Loading items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-8">
              {sortedCategories.map((cat) => (
                <div key={cat.id} className="category-card group cursor-pointer flex flex-col items-center">
                  
                  {/* Perfectly Sized Elegant Circular Thumbnail */}
                  <div className="img-wrapper relative w-full max-w-[150px] sm:max-w-[160px] aspect-square rounded-full mb-4 bg-slate-50 overflow-hidden flex items-center justify-center border-4 border-white shadow-md shadow-slate-200/60 mx-auto">
                    {cat.imagePath ? (
                      <>
                        <img
                          src={getImageUrl(cat.imagePath)}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-green-50/5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="p-2.5 bg-white/95 rounded-full shadow hidden sm:block">
                            <ArrowRight className="text-green-600" size={18} />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-green-50/60 w-full h-full flex items-center justify-center">
                        {getCategoryIcon(cat.name)}
                      </div>
                    )}
                  </div>

                  {/* Minimal & Clean Text Labels */}
                  <div className="text-center px-1 w-full">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-green-700 transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    {cat.subtitle && (
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-1 max-w-[180px] mx-auto">
                        {cat.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && sortedCategories.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ShoppingBag className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500 text-sm">We couldn't find any categories matching "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-green-600 font-semibold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}