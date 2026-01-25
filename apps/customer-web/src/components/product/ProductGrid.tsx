"use client";

import React from "react";
import { useProducts } from "@/features/products/hooks/useProducts";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import OutletSelector from "@/components/common/OutletSelector"; // Import the new component
import { useOutletStore } from "@/features/outlet/outlet.store";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

// --- Animations (Same as before) ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 60, damping: 15 } },
};

export default function ProductGrid() {
  const { products, loading, isOutletSelected } = useProducts();
  const { selectedOutlet, setOutlet } = useOutletStore();

  return (
    <section style={styles.productSection} className="product-section">
      {/* 1. Mount the Outlet Selector: It checks if outlet is needed */}
      <OutletSelector />

      <div style={styles.sectionContainer}>
        
        {/* Header */}
        <motion.div 
          style={styles.centeredHeader}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.h2 style={styles.title}>Our Fresh Picks</motion.h2>
          
          {/* Show Current Branch Name */}
          {selectedOutlet && (
            <div 
                className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors"
                onClick={() => setOutlet(null as any)} // Hack to trigger re-selection (set to null to open modal)
            >
                <MapPin size={14} />
                <span>{selectedOutlet.name} ({selectedOutlet.branch})</span>
                <span className="text-[10px] underline ml-1">Change</span>
            </div>
          )}

          <div style={styles.titleUnderline} />
        </motion.div>

        {/* Product Grid Content */}
        <motion.div 
          style={styles.productsGrid} 
          className="products-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {loading ? (
             // Loading Skeletons
             Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : !isOutletSelected ? (
             // No Outlet Selected State (Though modal should cover this)
             <div className="col-span-full text-center py-20 text-slate-400">
                Please select a branch to view the menu.
             </div>
          ) : products.length === 0 ? (
             // Empty Products State
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                <p>No products available at this branch right now.</p>
             </div>
          ) : (
             // Actual Products
             products.slice(0, 10).map((product) => (
               <motion.div key={product.id} variants={itemVariants}>
                 <ProductCard product={product} />
               </motion.div>
             ))
          )}
        </motion.div>

        {/* Footer Link */}
        <div style={styles.footerRow}>
           <Link href="/menu" style={{ textDecoration: 'none' }}>
             <motion.div 
               style={styles.viewAllButton}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
             >
               View Full Menu <ArrowRight size={18} />
             </motion.div>
          </Link>
        </div>

      </div>

      {/* Styles for Grid Responsiveness */}
      <style jsx>{`
        .products-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.5rem; }
        @media (max-width: 1280px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 1024px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .products-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .products-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

// ... styles object (keep your existing styles, they are fine) ...
const styles: { [key: string]: React.CSSProperties } = {
  productSection: { padding: "40px 0", background: "#ffffff" },
  sectionContainer: { maxWidth: "1350px", margin: "0 auto", padding: "0 1.5rem" },
  centeredHeader: { textAlign: "center", marginBottom: "40px", display: "flex", flexDirection: "column", alignItems: "center" },
  title: { fontSize: "2.2rem", fontWeight: 800, margin: 0, color: "#0f172a" }, // Simplified title for brevity
  titleUnderline: { width: "50px", height: "3px", background: "#22c55e", borderRadius: "2px", marginTop: "16px" },
  productsGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1.5rem" },
  footerRow: { marginTop: "50px", display: "flex", justifyContent: "center" },
  viewAllButton: { display: "flex", alignItems: "center", gap: "8px", color: "#15803d", fontWeight: 700, fontSize: "0.95rem", padding: "12px 24px", borderRadius: "50px", background: "#f0fdf4", border: "1px solid #bbf7d0", cursor: "pointer" },
};