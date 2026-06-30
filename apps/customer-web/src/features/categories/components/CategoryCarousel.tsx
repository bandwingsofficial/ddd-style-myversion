"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Leaf, 
  Coffee, 
  Utensils, 
  ShoppingBag,
  Droplets
} from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { useRouter } from "next/navigation";

// Fallback Icon Logic
const getCategoryIcon = (name: string, isMobile = false) => {
  const lowerName = name.toLowerCase();
  // Dynamically size icons based on device viewport
  const iconProps = { size: isMobile ? 32 : 48, color: "#214527" }; 

  if (lowerName.includes("cane") || lowerName.includes("juice")) return <Leaf {...iconProps} />;
  if (lowerName.includes("coconut") || lowerName.includes("water")) return <Droplets {...iconProps} />;
  if (lowerName.includes("tea") || lowerName.includes("coffee")) return <Coffee {...iconProps} />;
  if (lowerName.includes("food") || lowerName.includes("snack")) return <Utensils {...iconProps} />;
  
  return <ShoppingBag {...iconProps} />;
};

export const CategoryCarousel = () => {
  const { categories, isLoading } = useCategories();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showControls, setShowControls] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Detect mobile view to adjust fallback icon sizes natively
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. SORT ALPHABETICALLY (A-Z)
  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  // Check overflow logic
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowControls(scrollWidth > clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [sortedCategories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth <= 768 ? 250 : 400; 
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";
    const cleanPath = path.replace(/^\//, "");
    return `${baseUrl}/${cleanPath}`;
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
         <div className="spinner"></div>
         <style jsx>{`
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #f0fdf4;
              border-top-color: #4ade80;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
         `}</style>
      </div>
    );
  }

  if (!sortedCategories || sortedCategories.length === 0) return null;

  return (
    <>
      <style jsx>{`
        /* --- SCROLLBAR HIDING --- */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* --- TITLE SHINE ANIMATION --- */
        .shine-title {
          background: linear-gradient(
            to right,
            #214527 20%,
            #4ade80 40%,
            #4ade80 60%,
            #214527 80%
          );
          background-size: 200% auto;
          color: #214527;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 4s linear infinite;
        }

        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }

        /* --- HOVER EFFECTS --- */
        .category-card {
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
        
        /* --- BUTTONS --- */
        .nav-btn {
          transition: all 0.2s ease;
        }
        .nav-btn:hover {
          background-color: #f0fdf4 !important;
          border-color: #4ade80 !important;
          transform: scale(1.05);
        }

        /* --- SUBTITLE LINE CLAMP --- */
        .subtitle-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ==========================================================================
           MOBILE UI RESPONSIVE BREAKPOINTS (Max-width: 768px)
           ========================================================================== */
        @media (max-width: 768px) {
          .responsive-section {
            padding: 2rem 0 !important;
          }
          .responsive-header-row {
            margin-bottom: 1.5rem !important;
          }
          .responsive-title {
            font-size: 1.75rem !important;
          }
          /* Hide desktop control buttons on tiny viewports if they overlap titles */
          .responsive-controls {
            display: none !important;
          }
          /* Tighten carousel track gap for smaller smartphone screen aesthetics */
          .responsive-track {
            gap: 1.25rem !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          /* Responsive sizing overrides for cards and circles */
          .category-card {
            width: 110px !important;
            gap: 0.75rem !important;
          }
          .image-circle {
            width: 100px !important;
            height: 100px !important;
          }
          .category-name {
            font-size: 0.95rem !important;
          }
          .subtitle-clamp {
            font-size: 0.75rem !important;
          }
        }
      `}</style>

      <section style={styles.section} className="responsive-section">
        <div style={styles.container}>
          
          {/* Header Row (Centered) */}
          <div style={styles.headerRow} className="responsive-header-row">
            <h2 style={styles.title} className="shine-title responsive-title">
              Shop by Category
            </h2>
            
            {showControls && (
              <div style={styles.controlsAbsolute} className="responsive-controls">
                <button onClick={() => scroll("left")} style={styles.navButton} className="nav-btn">
                  <ChevronLeft size={24} color="#214527" />
                </button>
                <button onClick={() => scroll("right")} style={styles.navButton} className="nav-btn">
                  <ChevronRight size={24} color="#214527" />
                </button>
              </div>
            )}
          </div>

          {/* Carousel Track */}
          <div 
            ref={scrollContainerRef} 
            style={{
              ...styles.carouselTrack,
              justifyContent: showControls ? 'flex-start' : 'center' 
            }}
            className="hide-scrollbar responsive-track"
          >
            {sortedCategories.map((cat) => (
              <div
  key={cat.id}
  style={styles.categoryCard}
  className="category-card"
  onClick={() => router.push(`/category/${cat.id}`)}
> 
                {/* Image Circle */}
                <div style={styles.imageCircle} className="image-circle">
                  {cat.imagePath ? (
                    <>
                      <img
                        src={getImageUrl(cat.imagePath)}
                        alt={cat.name}
                        style={styles.image}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div style={styles.fallbackIcon}>
                        {getCategoryIcon(cat.name, isMobileView)}
                      </div>
                    </>
                  ) : (
                    getCategoryIcon(cat.name, isMobileView)
                  )}
                </div>

                {/* Text Group */}
                <div style={styles.textGroup}>
                  {/* Name */}
                  <span style={styles.categoryName} className="category-name">
                    {cat.name}
                  </span>

                  {/* Subtitle */}
                  {cat.subtitle && (
                    <span style={styles.subtitle} className="subtitle-clamp">
                      {cat.subtitle}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
};

// --- STYLES OBJECT (Kept original configurations clean for Home/Desktop layout) ---
const styles: { [key: string]: React.CSSProperties } = {
  section: {
    width: "100%",
    padding: "4rem 0", 
    backgroundColor: "#ffffff",
  },
  container: {
    maxWidth: "1440px",
    margin: "0 auto",
    padding: "0 24px",
    position: "relative",
  },
  loadingContainer: {
    width: "100%",
    height: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "3rem",
    position: "relative",
  },
  title: {
    fontSize: "2.5rem", 
    fontWeight: 700,
    fontFamily: "serif", 
    margin: 0,
    textAlign: "center",
  },
  controlsAbsolute: {
    display: "flex",
    gap: "12px",
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
  },
  navButton: {
    width: "44px", 
    height: "44px",
    borderRadius: "50%",
    border: "1px solid #e2e8f0",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  carouselTrack: {
    display: "flex",
    gap: "3rem", 
    overflowX: "auto",
    paddingBottom: "20px",
    scrollBehavior: "smooth",
    paddingLeft: "10px", 
    paddingRight: "10px",
  },
  categoryCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.25rem",
    cursor: "pointer",
    flexShrink: 0,
    width: "200px", 
  },
  imageCircle: {
    width: "190px", 
    height: "190px", 
    borderRadius: "50%",
    backgroundColor: "#f8fafc",
    border: "2px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    transition: "all 0.3s ease",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 10,
    position: "relative",
  },
  fallbackIcon: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
    backgroundColor: "#f0fdf4", 
  },
  textGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    width: "100%",
  },
  categoryName: {
    fontSize: "1.2rem", 
    fontWeight: 700,
    color: "#334155",
    textAlign: "center",
    transition: "color 0.3s ease",
  },  
  subtitle: {
    fontSize: "0.9rem", 
    color: "#64748b",
    textAlign: "center",
    lineHeight: "1.4",
    maxWidth: "100%",
  },
};