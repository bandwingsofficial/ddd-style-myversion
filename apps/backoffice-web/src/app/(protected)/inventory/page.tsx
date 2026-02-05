"use client";

import { useState } from "react";
import InventoryTable from "@/features/inventory/components/inventory-table";
import { useInventory } from "@/features/inventory/hooks/use-inventory";
import { 
  Package, 
  LayoutGrid, 
  Plus, 
  Search,
  X,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import InitializeInventoryModal from "@/features/inventory/components/initialize-inventory-modal";

export default function InventoryPage() {
  const [isInitOpen, setIsInitOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { refresh } = useInventory();

  return (
    // 1. PAGE CONTAINER
    <div className="min-h-screen bg-background p-6 md:p-8 font-sans animate-in fade-in duration-500">
      
      {/* 2. HEADER SECTION */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Title Group */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory</h1>
            </div>
        </div>

        {/* Actions Group (Search + Button) */}
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          
          {/* Search Bar */}
          <div className="relative w-full max-w-xs">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Initialize Button */}
          <button 
            onClick={() => setIsInitOpen(true)}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-95"
          >
            <Plus size={18} />
            Initialize
          </button>
        </div>
      </div>

      {/* 3. CONTENT CARD */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Package size={16} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Inventory Overview
            </h3>
          </div>
          
          {/* Live Sync Badge */}
          <div className="flex items-center gap-2 rounded-full bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-wide border border-border text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Sync
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="p-0">
          <InventoryTable searchQuery={searchQuery} />
        </div>
      </div>

      {/* 4. MODALS */}
      <AnimatePresence>
        {isInitOpen && (
          <InitializeInventoryModal 
            onClose={() => setIsInitOpen(false)} 
            onSuccess={() => {
              refresh();
              setIsInitOpen(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}