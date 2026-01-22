"use client";

import React from "react";
import { useProducts } from "@/features/products/hooks/useProducts";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

// --- Animations ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 60, damping: 15 } 
  },
};

const subtitleVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, delay: 0.2, ease: "easeOut" }
  }
};

export default function ProductGrid() {
  const { products, loading } = useProducts();

  return (
    <section style={styles.productSection} className="product-section">
      {/* Dynamic CSS for Grid Responsiveness - Updated for denser grid */}
      <style jsx>{`
        @media (max-width: 1280px) {
          .products-grid { 
            grid-template-columns: repeat(4, 1fr) !important; 
          }
        }
        @media (max-width: 1024px) {
          .products-grid { 
            grid-template-columns: repeat(3, 1fr) !important; 
            gap: 1.5rem !important;
          }
        }
        @media (max-width: 768px) {
          .products-grid { 
            grid-template-columns: repeat(2, 1fr) !important; 
            gap: 1rem !important; 
          }
        }
        @media (max-width: 480px) {
          .products-grid { 
            grid-template-columns: 1fr !important; 
          }
        }
      `}</style>

      <div style={styles.sectionContainer}>
        
        {/* Header with Shine & Subtitle */}
        <motion.div 
          style={styles.centeredHeader}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h2 
            style={styles.title} 
            className="title"
            animate={{ 
              backgroundPosition: ["0% center", "200% center"] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            Our Fresh Picks
          </motion.h2>

          <motion.p 
            style={styles.subtitle}
            variants={subtitleVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Handpicked daily for the freshest taste experience.
          </motion.p>
          
          <div style={styles.titleUnderline} />
        </motion.div>

        {/* Product Grid */}
        <motion.div 
          style={styles.productsGrid} 
          className="products-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            : products.slice(0, 10).map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </motion.div>

        {/* Footer Link */}
        <div style={styles.footerRow}>
           <Link href="/menu" style={{ textDecoration: 'none' }}>
             <motion.div 
               style={styles.viewAllButton}
               whileHover={{ scale: 1.05, backgroundColor: "#dcfce7" }}
               whileTap={{ scale: 0.95 }}
             >
               View Full Menu <ArrowRight size={18} />
             </motion.div>
          </Link>
        </div>

      </div>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  productSection: {
    padding: "40px 0", // Reduced padding
    background: "#ffffff",
  },
  sectionContainer: {
    maxWidth: "1350px", // Slightly wider to fit 5 items comfortably
    margin: "0 auto",
    padding: "0 1.5rem",
  },
  centeredHeader: {
    textAlign: "center",
    marginBottom: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: 800,
    margin: 0,
    letterSpacing: "-0.02em",
    backgroundImage: "linear-gradient(to right, #0f172a 20%, #22c55e 40%, #22c55e 60%, #0f172a 80%)",
    backgroundSize: "200% auto",
    color: "transparent",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#64748b",
    marginTop: "8px",
    marginBottom: "0",
    lineHeight: "1.5",
  },
  titleUnderline: {
    width: "50px",
    height: "3px",
    background: "#22c55e",
    borderRadius: "2px",
    marginTop: "16px",
  },
  productsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)", // Changed from 4 to 5
    gap: "1.5rem", // Reduced gap from 2.5rem
  },
  footerRow: {
    marginTop: "50px",
    display: "flex",
    justifyContent: "center",
  },
  viewAllButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#15803d",
    fontWeight: 700,
    fontSize: "0.95rem",
    padding: "12px 24px",
    borderRadius: "50px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
};