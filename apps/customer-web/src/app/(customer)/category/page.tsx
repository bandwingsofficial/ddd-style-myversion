"use client";

import React, { useMemo, useState } from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { Search, Leaf, Droplets, Coffee, Utensils, ShoppingBag, ArrowRight } from "lucide-react";

const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  const iconProps = { size: 40, color: "#166534" }; 
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
    <div className="min-h-screen bg-[#FDFDFD]">
      <Header />

      <style jsx>{`
        .hero-gradient {
          background: radial-gradient(circle at top right, #f0fdf4 0%, transparent 40%),
                      radial-gradient(circle at bottom left, #f0fdf4 0%, transparent 40%);
        }
        .shine-text {
          background: linear-gradient(to right, #14532d 20%, #22c55e 40%, #22c55e 60%, #14532d 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 5s linear infinite;
        }
        @keyframes shine { to { background-position: 200% center; } }
        
        .category-card {
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .category-card:hover {
          transform: translateY(-8px);
        }
        .img-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .category-card:hover .img-wrapper::after {
          box-shadow: inset 0 0 0 3px #4ade80;
        }
      `}</style>

      <main className="pt-24 pb-24 hero-gradient">
        {/* Adjusted Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-3">
                Explore <span className="shine-text">Our Collections</span>
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed">
                Discover our hand-picked categories of 100% natural juices and farm-fresh snacks 
                delivered straight to your door.
              </p>
            </div>

            {/* Repositioned Search Bar */}
            <div className="relative w-full md:w-80 md:mt-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
              />
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-7xl mx-auto px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-400 font-medium">Loading fresh items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {sortedCategories.map((cat) => (
                <div key={cat.id} className="category-card group cursor-pointer">
                  {/* Modern Circle Image */}
                  <div className="img-wrapper relative aspect-square rounded-full mb-6 bg-slate-50 overflow-hidden flex items-center justify-center border-8 border-white shadow-xl shadow-slate-200/50">
                    {cat.imagePath ? (
                      <>
                        <img
                          src={getImageUrl(cat.imagePath)}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-green-50/10 opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="p-4 bg-white/90 rounded-full shadow-lg">
                                <ArrowRight className="text-green-600" size={24} />
                             </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-green-50 w-full h-full flex items-center justify-center">
                        {getCategoryIcon(cat.name)}
                      </div>
                    )}
                  </div>

                  {/* Clean Text Label */}
                  <div className="text-center px-2">
                    <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-green-700 transition-colors">
                      {cat.name}
                    </h3>
                    <div className="h-1 w-0 bg-green-500 mx-auto transition-all duration-300 group-hover:w-12 mb-2"></div>
                    {cat.subtitle && (
                      <p className="text-slate-500 text-sm leading-snug line-clamp-2">
                        {cat.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && sortedCategories.length === 0 && (
            <div className="text-center py-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <ShoppingBag className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 text-lg">We couldn't find any categories matching "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-4 text-green-600 font-bold hover:underline"
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