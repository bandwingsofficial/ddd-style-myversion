"use client";

import React, { useMemo } from "react";
// 1. Direct Imports for Header & Footer
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

import { 
  Leaf, 
  Coffee, 
  Utensils, 
  ShoppingBag,
  Droplets
} from "lucide-react";
import { useCategories } from "@/features/categories/hooks/useCategories"; 

// --- Fallback Icon Logic ---
const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  const iconProps = { size: 48, color: "#214527" }; 

  if (lowerName.includes("cane") || lowerName.includes("juice")) return <Leaf {...iconProps} />;
  if (lowerName.includes("coconut") || lowerName.includes("water")) return <Droplets {...iconProps} />;
  if (lowerName.includes("tea") || lowerName.includes("coffee")) return <Coffee {...iconProps} />;
  if (lowerName.includes("food") || lowerName.includes("snack")) return <Utensils {...iconProps} />;
  
  return <ShoppingBag {...iconProps} />;
};

export default function CategoriesPage() {
  const { categories, isLoading } = useCategories();

  // Sort Alphabetically
  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const getImageUrl = (path: string) => {
    if (!path) return "";
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
    const cleanPath = path.replace(/^\//, "");
    return `${baseUrl}/${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 2. Header Component */}
      <Header />

      {/* Main Content Padding: 
         Mobile: pt-[90px] 
         Desktop: pt-[140px] (md breakpoint)
      */}
      <main className="pb-[60px] pt-[90px] md:pt-[140px]">
        <section className="mx-auto max-w-[1300px] px-4 md:px-8">
          
          {/* 3. Left-Aligned Page Header */}
          <header className="mb-10 border-b border-slate-100 pb-4">
            <h1 className="text-left text-[1.75rem] font-extrabold text-[#052e16] md:text-[2rem]">
              Our Categories
            </h1>
          </header>

          {/* 4. Loading State */}
          {isLoading && (
             <div className="flex justify-center py-16 text-slate-400">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#f0fdf4] border-t-[#4ade80]"></div>
             </div>
          )}

          {/* 5. Grid Layout */}
          {!isLoading && (
            <>
              {(!sortedCategories || sortedCategories.length === 0) ? (
                <div className="flex justify-center py-16 text-slate-400">
                   <p>No categories found.</p>
                </div>
              ) : (
                /* Grid Logic:
                   Mobile: grid-cols-2 (2 columns)
                   Desktop: grid-cols-[repeat(auto-fill...)] (Auto fit)
                */
                <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-8 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:gap-x-8 md:gap-y-12">
                  {sortedCategories.map((cat) => (
                    <div 
                      key={cat.id} 
                      className="group flex w-full max-w-[240px] cursor-pointer flex-col items-center gap-5 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2"
                    >
                      
                      {/* Image Circle */}
                      <div className="relative flex h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-50 transition-all duration-300 group-hover:border-[#4ade80] group-hover:shadow-[0_15px_30px_-5px_rgba(34,197,94,0.3)] md:h-[190px] md:w-[190px]">
                        {cat.imagePath ? (
                          <>
                            <img
                              src={getImageUrl(cat.imagePath)}
                              alt={cat.name}
                              className="relative z-10 h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#f0fdf4]">
                              {getCategoryIcon(cat.name)}
                            </div>
                          </>
                        ) : (
                          getCategoryIcon(cat.name)
                        )}
                      </div>

                      {/* Text Group */}
                      <div className="flex w-full flex-col items-center gap-1.5 text-center">
                        <span className="text-xl font-bold text-slate-700 transition-colors duration-300 group-hover:text-[#16a34a]">
                          {cat.name}
                        </span>

                        {cat.subtitle && (
                          <span className="line-clamp-2 text-sm leading-snug text-slate-500">
                            {cat.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* 6. Footer Component */}
      <Footer />
    </div>
  );
}