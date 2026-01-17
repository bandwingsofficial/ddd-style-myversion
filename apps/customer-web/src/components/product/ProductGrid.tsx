"use client";

import { useProducts } from "@/features/products/hooks/useProducts";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ProductGrid() {
  const { products, loading } = useProducts();

  return (
    <section style={styles.productSection} className="product-section">
      {/* Dynamic CSS for Grid Responsiveness */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .products-grid { 
            grid-template-columns: repeat(3, 1fr) !important; 
          }
        }
        @media (max-width: 768px) {
          .products-grid { 
            grid-template-columns: repeat(2, 1fr) !important; 
            gap: 1.5rem !important; 
          }
          .title { font-size: 1.5rem !important; }
        }
        @media (max-width: 480px) {
          .products-grid { 
            grid-template-columns: 1fr !important; 
          }
        }
      `}</style>

      <div style={styles.sectionContainer}>
        {/* Centered Header as per Wireframe */}
        <div style={styles.centeredHeader}>
          <h2 style={styles.title} className="title">Our Fresh Picks</h2>
        </div>

        <div style={styles.productsGrid} className="products-grid">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            : products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        {/* Optional: Footer Link if you want to keep the View Menu option */}
        <div style={styles.footerRow}>
           <Link href="/menu" style={styles.viewAll}>
            View Full Menu <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  productSection: {
    padding: "60px 0",
    background: "#ffffff",
  },
  sectionContainer: {
    margin: "0 auto",
    padding: "0 2rem",
  },
  centeredHeader: {
    textAlign: "center",
    marginBottom: "50px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "2.5rem",
  },
  footerRow: {
    marginTop: "50px",
    display: "flex",
    justifyContent: "center",
  },
  viewAll: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#16a34a",
    fontWeight: 700,
    fontSize: "0.95rem",
    textDecoration: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    background: "#f0fdf4",
    transition: "all 0.2s",
  },
};