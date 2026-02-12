"use client";

import { useState, useEffect } from "react";
import { ProductsTable } from "@/features/products/components/products-table";
import CreateProductModal from "@/features/products/components/create-product-dialog";
import { LayoutGrid, Plus, Search, Filter, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useProducts } from "@/features/products/hooks/use-products";
import { CategoriesApi } from "@/features/categories/api/categories.api";

export default function ProductsPage() {
  const { products, loading, refresh } = useProducts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // --- NEW FILTER STATES ---
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch categories for the filter dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await CategoriesApi.getAll();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories for filter", err);
      }
    };
    loadCategories();
  }, []);

  // --- UPDATED FILTER LOGIC ---
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.value.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && p.status === "ACTIVE") || 
      (statusFilter === "inactive" && p.status !== "ACTIVE");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setStatusFilter("all");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-2">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        {/* Left: Title Group */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
            <LayoutGrid size={22} className="text-emerald-500" />
          </div>
          <div>
            <h1 className="m-0 text-2xl font-extrabold text-slate-900">Products Management</h1>
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

      {/* --- FILTER BAR SECTION --- */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 mr-2">
          <Filter size={16} />
          <span className="text-sm font-bold uppercase tracking-wider">Filters:</span>
        </div>

        {/* Category Filter */}
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        {/* Active Filters Summary & Reset */}
        {(selectedCategory !== "all" || statusFilter !== "all" || searchQuery !== "") && (
          <button 
            onClick={resetFilters}
            className="ml-auto flex items-center gap-1 text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors"
          >
            <X size={14} /> Clear All
          </button>
        )}
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