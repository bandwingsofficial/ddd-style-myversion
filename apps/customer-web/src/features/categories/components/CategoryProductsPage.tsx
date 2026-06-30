"use client";

import React from "react";
import ProductCard from "@/components/product/ProductCard";
import { useCategoryProducts } from "../hooks/useCategoryProducts";
import { ShoppingBag, Store } from "lucide-react";

interface Props {
  categoryId: string;
}

export default function CategoryProductsPage({ categoryId }: Props) {
  const {
    products,
    categoryName,
    loading,
    isOutletSelected,
  } = useCategoryProducts(categoryId);

  if (!isOutletSelected) {
    return (
      <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 my-4">
        <Store className="mx-auto text-slate-400 mb-3" size={40} />
        <h2 className="text-lg font-bold text-slate-700">
          Please select an outlet
        </h2>
        <p className="text-sm text-slate-400 mt-1">Select your nearest store to browse fresh items.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
        <p className="mt-3 text-slate-400 text-sm font-medium">Loading products...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl w-full">
      <style jsx>{`
        .shine-text {
          background: linear-gradient(to right, #14532d 20%, #22c55e 40%, #22c55e 60%, #14532d 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 5s linear infinite;
        }
        @keyframes shine { to { background-position: 200% center; } }
      `}</style>

      {/* Styled Clean Header Section */}
      <div className="mb-8 border-b border-slate-100 pb-5">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-800">
          Explore <span className="shine-text">{categoryName}</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400 font-medium">
          {products.length} {products.length === 1 ? "Product available" : "Products available"}
        </p>
      </div>

      {/* Grid Content / Empty Fallback */}
      {products.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <ShoppingBag className="mx-auto text-slate-300 mb-3" size={40} />
          <h2 className="text-base font-semibold text-slate-700">
            No products found
          </h2>
          <p className="text-xs text-slate-400 mt-1">We don't have items stocked in this collection right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
}