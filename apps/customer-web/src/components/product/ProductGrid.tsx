"use client";

import React from "react";
import { useProducts } from "@/features/products/hooks/useProducts";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import OutletSelector from "@/components/common/OutletSelector";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

// --- Animations ---
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
    <section className="py-0 bg-white">
      {/* 1. Mount the Outlet Selector */}
      <OutletSelector />

      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-10 flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.h2 className="text-[2.2rem] font-[800] m-0 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-950 bg-clip-text text-transparent">
  Our Fresh Picks
</motion.h2>
          
          {/* Show Current Branch Name */}
          {selectedOutlet && (
            <div 
                className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors"
                onClick={() => setOutlet(null as any)} 
            >
                <MapPin size={14} />
                <span>{selectedOutlet.name} ({selectedOutlet.branch})</span>
                <span className="text-[10px] underline ml-1">Change</span>
            </div>
          )}

          <div className="w-[50px] h-[3px] bg-emerald-500 rounded-[2px] mt-4" />
        </motion.div>

        {/* Product Grid Content */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4 xl:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {loading ? (
             // Loading Skeletons
             Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)
          ) : !isOutletSelected ? (
             // No Outlet Selected State
             <div className="col-span-full text-center py-20 text-slate-400">
               No Near by outlets find to selected destination.you can change the location in header.
             </div>
          ) : products.length === 0 ? (
             // Empty Products State
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
               <p>No products available at this branch right now.</p>
             </div>
          ) : (
             // Actual Products
             products.slice(0, 10).map((product) => (
               <motion.div key={product.id} variants={itemVariants} className="h-full">
                 <ProductCard product={product} />
               </motion.div>
             ))
          )}
        </motion.div>

        {/* Footer Link */}
        <div className="mt-[50px] flex justify-center">
            <Link href="/menu" className="no-underline">
              <motion.div 
                className="flex items-center gap-2 text-emerald-700 font-[700] text-[0.95rem] px-6 py-3 rounded-full bg-emerald-50 border border-emerald-200 cursor-pointer transition-colors"
                whileHover={{ scale: 1.05 }}
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