"use client";

import React from "react";
import { useProducts } from "@/features/products/hooks/useProducts";
import ProductCard from "./ProductCard";
import { useLocationOrchestratorStore } from "@/features/location/location-orchestrator.store";
import { useDeliveryAppState } from "@/features/location/hooks/useDeliveryAppState";
import { ProductGridShimmer } from "@/components/ui/Shimmer";
import NoDeliveryState, {
  ConnectionErrorState,
} from "@/components/location/NoDeliveryState";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 60, damping: 15 } },
};

export default function ProductGrid() {
  const { products, loading, error, refresh } = useProducts();
  const { showShimmer, isReady, isNoOutlet, isError, errorMessage, selectedOutlet, needsLocation } =
    useDeliveryAppState();
  const openOutletPicker = useLocationOrchestratorStore(
    (state) => state.openOutletPicker,
  );

  const showProductShimmer = showShimmer || (isReady && loading);

  return (
    <section className="relative bg-white py-0">
      {showShimmer && !isNoOutlet && !isError && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-white/30 backdrop-blur-[1px]" />
      )}

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6">
        <motion.div
          className="mb-10 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.h2 className="m-0 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-950 bg-clip-text text-[2.2rem] font-[800] text-transparent">
            Our Fresh Picks
          </motion.h2>

          {selectedOutlet && (
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
              onClick={openOutletPicker}
            >
              <MapPin size={14} />
              <span>{selectedOutlet.name}</span>
              <span className="ml-1 text-[10px] underline">Change</span>
            </button>
          )}

          <div className="mt-4 h-[3px] w-[50px] rounded-[2px] bg-emerald-500" />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 xl:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {showProductShimmer ? (
            <div className="col-span-full">
              <ProductGridShimmer count={5} />
            </div>
          ) : isNoOutlet || needsLocation ? (
            <NoDeliveryState
              title={
                needsLocation
                  ? "Choose your delivery location"
                  : undefined
              }
              description={
                needsLocation
                  ? "Select where you want your order delivered to browse products and checkout."
                  : undefined
              }
            />
          ) : isError ? (
            <ConnectionErrorState message={errorMessage ?? "Unable to connect."} />
          ) : error ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm font-medium text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => void refresh()}
                className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
              <p>No products available at this branch right now.</p>
            </div>
          ) : (
            products.slice(0, 10).map((product) => (
              <motion.div key={product.id} variants={itemVariants} className="h-full">
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </motion.div>

        <div className="mt-[50px] flex justify-center">
          <Link href="/menu" className="no-underline">
            <motion.div
              className="flex cursor-pointer items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-[0.95rem] font-[700] text-emerald-700 transition-colors"
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
