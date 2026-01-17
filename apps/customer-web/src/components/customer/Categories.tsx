"use client";

import React from "react";
import Link from "next/link";

// Custom SVG Icons matching the uploaded design
const SugarcaneIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 22V2M11 22V2M15 22V2" />
    <path d="M7 7H11M11 12H15M7 17H11" />
    <path d="M15 5C17.5 3 21 4 21 4C21 4 19 7.5 17 10" />
  </svg>
);

const CoconutIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8a4 4 0 0 0-4 4M12 3l2-2M15 4l1-1" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

const ComboIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const SeasonalIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L9.5 7H4.5L8.5 11L7 16L12 13L17 16L15.5 11L19.5 7H14.5L12 2Z" />
  </svg>
);

const categories = [
  { 
    id: "cane", 
    name: "Sugarcane Juice", 
    description: "Freshly pressed natural energy",
    icon: <SugarcaneIcon />, 
    color: "#22c55e", 
    bgColor: "#f0fdf4" 
  },
  { 
    id: "coconut", 
    name: "Tender Coconut", 
    description: "Creamy hydration from the source",
    icon: <CoconutIcon />, 
    color: "#0ea5e9", 
    bgColor: "#f0f9ff" 
  },
  { 
    id: "combos", 
    name: "Value Combos", 
    description: "Perfect pairings for sharing",
    icon: <ComboIcon />, 
    color: "#f59e0b", 
    bgColor: "#fffbeb" 
  },
  { 
    id: "seasonal", 
    name: "Seasonal Specials", 
    description: "Limited time harvest flavors",
    icon: <SeasonalIcon />, 
    color: "#ec4899", 
    bgColor: "#fdf2f8" 
  },
];

export default function Categories() {
  return (
    <section style={styles.categoriesSection}>
      <div style={styles.sectionContainer}>
        <div style={styles.centeredHeader}>
          <h2 style={styles.title}>Explore Our Categories</h2>
          <p style={styles.subtitle}>Sourced directly from organic farms, ensuring peak flavor and nutrition.</p>
        </div>

        <div style={styles.categoriesGrid}>
          {categories.map((cat) => (
            <div key={cat.id} style={styles.categoryCard} className="category-card">
              <div style={{ ...styles.iconWrapper, color: cat.color, backgroundColor: cat.bgColor }}>
                {cat.icon}
              </div>
              <h3 style={styles.categoryName}>{cat.name}</h3>
              <p style={styles.categoryDesc}>{cat.description}</p>
              <Link href={`/menu?category=${cat.id}`} style={styles.orderLink} className="order-link">
                Order Now →
              </Link>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .category-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
          border-color: #22c55e !important;
        }
        .order-link {
          transition: color 0.2s ease;
        }
        .category-card:hover .order-link {
          color: #22c55e !important;
        }
        @media (max-width: 1024px) {
          .categories-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .categories-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  categoriesSection: {
    padding: "10px 0",
    backgroundColor: "#ffffff",
  },
  sectionContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
  },
  centeredHeader: {
    textAlign: "center",
    marginBottom: "60px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 800,
    color: "#064e3b", // Dark green from your design
    marginBottom: "16px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "1.1rem",
  },
  categoriesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
  },
  categoryCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 24px",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #f1f5f9",
    cursor: "pointer",
    textAlign: "center",
  },
  iconWrapper: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
  },
  categoryName: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: "8px",
  },
  categoryDesc: {
    fontSize: "0.9rem",
    color: "#64748b",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  orderLink: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#94a3b8",
    textDecoration: "none",
  }
};