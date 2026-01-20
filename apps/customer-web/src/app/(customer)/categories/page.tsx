"use client";

import React, { useMemo } from "react";
// 1. Direct Imports for Header & Footer (just like MenuPage)
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
    <div className="categories-page">
      {/* 2. Header Component */}
      <Header />

      <main className="main-content">
        <section className="container">
          
          {/* 3. Left-Aligned Page Header (Same as MenuPage) */}
          <header className="page-header">
            <h1 className="title">Our Categories</h1>
          </header>

          {/* 4. Loading State */}
          {isLoading && (
             <div className="loading-state">
                <div className="spinner"></div>
             </div>
          )}

          {/* 5. Grid Layout */}
          {!isLoading && (
            <>
              {(!sortedCategories || sortedCategories.length === 0) ? (
                <div className="empty-state">
                   <p>No categories found.</p>
                </div>
              ) : (
                <div className="grid-layout">
                  {sortedCategories.map((cat) => (
                    <div key={cat.id} className="category-card">
                      
                      {/* Image Circle */}
                      <div className="image-circle">
                        {cat.imagePath ? (
                          <>
                            <img
                              src={getImageUrl(cat.imagePath)}
                              alt={cat.name}
                              className="image"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <div className="fallback-icon">
                              {getCategoryIcon(cat.name)}
                            </div>
                          </>
                        ) : (
                          getCategoryIcon(cat.name)
                        )}
                      </div>

                      {/* Text Group */}
                      <div className="text-group">
                        <span className="category-name">
                          {cat.name}
                        </span>

                        {cat.subtitle && (
                          <span className="subtitle subtitle-clamp">
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

      <style jsx>{`
        .categories-page { 
          background: #ffffff; 
          min-height: 100vh; 
        }
        
        .main-content { 
          padding-top: 140px; /* Space for fixed header */
          padding-bottom: 60px; 
        }
        
        .container { 
          max-width: 1300px; 
          margin: 0 auto; 
          padding: 0 2rem; 
        }

        .page-header {
          margin-bottom: 2.5rem;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 1rem;
        }

        .title {
          font-size: 2rem;
          font-weight: 800;
          color: #052e16; /* Deep green */
          text-align: left;
          margin: 0;
        }

        /* Loading & Empty States */
        .loading-state, .empty-state {
          padding: 4rem 0;
          display: flex;
          justify-content: center;
          color: #94a3b8;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0fdf4;
          border-top-color: #4ade80;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* GRID LAYOUT (Matches MenuPage responsive logic) */
        .grid-layout {
          display: grid;
          /* Fits columns automatically, min 220px wide */
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 3rem 2rem;
          justify-items: center;
        }

        /* --- CATEGORY CARD STYLES --- */
        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          cursor: pointer;
          width: 100%;
          max-width: 240px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .category-card:hover {
          transform: translateY(-8px);
        }
        .category-card:hover .image-circle {
          border-color: #4ade80;
          box-shadow: 0 15px 30px -5px rgba(34, 197, 94, 0.3);
        }
        .category-card:hover .category-name {
          color: #16a34a;
        }

        .image-circle {
          width: 190px;
          height: 190px;
          border-radius: 50%;
          background-color: #f8fafc;
          border: 2px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          transition: all 0.3s ease;
        }
        .image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 10;
          position: relative;
        }
        .fallback-icon {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 0;
          background-color: #f0fdf4; 
        }

        .text-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          width: 100%;
          text-align: center;
        }
        .category-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #334155;
          transition: color 0.3s ease;
        }  
        .subtitle {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.4;
        }
        .subtitle-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 768px) {
          .main-content { padding-top: 90px; }
          .title { font-size: 1.75rem; }
          .container { padding: 0 1rem; }
          /* On mobile, maybe 2 columns is better for categories too */
          .grid-layout { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 2rem 1rem; 
          }
          .image-circle {
            width: 140px; /* Smaller circles on mobile */
            height: 140px;
          }
        }
      `}</style>
    </div>
  );
}