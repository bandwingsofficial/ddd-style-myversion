"use client";

import { useState } from "react";
import { ProductsTable } from "@/features/products/components/products-table";
import CreateProductModal from "@/features/products/components/create-product-dialog";
import { LayoutGrid, Plus, Search } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useProducts } from "@/features/products/hooks/use-products";

export default function ProductsPage() {
  const { products, loading, refresh } = useProducts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters by Product Name
  const filteredProducts = products.filter((p) =>
    p.name.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 px-8 py-5">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        {/* Left: Title Group */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
            <LayoutGrid size={22} className="text-emerald-500" />
          </div>
          <div>
            <h1 className="m-0 text-2xl font-extrabold text-slate-900">Products Management</h1>
            <p className="m-0 text-sm font-medium text-slate-500">Super Admin Control Panel</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-3 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-[280px] rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> Create Product
          </button>
        </div>
      </div>

      {/* TABLE */}
      <ProductsTable 
        products={filteredProducts} 
        loading={loading} 
        refresh={refresh} 
      />

      {/* MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateProductModal 
            onClose={() => setIsCreateModalOpen(false)} 
            onSuccess={() => { refresh(); setIsCreateModalOpen(false); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}