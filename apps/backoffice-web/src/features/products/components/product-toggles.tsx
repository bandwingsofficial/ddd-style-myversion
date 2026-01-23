"use client";

import { Switch } from "@/components/ui/switch";
import { ProductsAPI } from "../services/products.api";
import { Product } from "../types/product.types";
import { TrendingUp, Power } from "lucide-react";

interface ProductTogglesProps {
  product: Product;
  onRefresh: () => void;
}

export function ProductToggles({ product, onRefresh }: ProductTogglesProps) {
  
  const handleStatusToggle = async () => {
    // If active, disable it. If inactive, enable it.
    product.status === "ACTIVE" 
      ? await ProductsAPI.disable(product.id) 
      : await ProductsAPI.enable(product.id);
    onRefresh();
  };

  const handleTrendingToggle = async () => {
    await ProductsAPI.markTrending(product.id, !product.trendState.trending);
    onRefresh();
  };

  const isActive = product.status === "ACTIVE";
  const isTrending = product.trendState.trending;

  return (
    <div className="flex flex-col gap-3">
      
      {/* 1. VISIBILITY TOGGLE (Green Theme) */}
      <div 
        className={`flex items-center justify-between rounded-xl border p-3 transition-all duration-200 ${
          isActive 
            ? "border-green-200/50 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10" 
            : "border-border bg-card"
        }`}
      >
        <div className="flex items-center gap-3">
          <div 
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              isActive 
                ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" 
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Power size={16} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
              Status
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {isActive ? "Visible in App" : "Hidden from Users"}
            </span>
          </div>
        </div>
        
        <Switch
          checked={isActive}
          onCheckedChange={handleStatusToggle}
          className="data-[state=checked]:bg-green-600"
        />
      </div>

      {/* 2. TRENDING TOGGLE (Amber Theme) */}
      <div 
        className={`flex items-center justify-between rounded-xl border p-3 transition-all duration-200 ${
          isTrending 
            ? "border-amber-200/50 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10" 
            : "border-border bg-card"
        }`}
      >
        <div className="flex items-center gap-3">
          <div 
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              isTrending 
                ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" 
                : "bg-muted text-muted-foreground"
            }`}
          >
            <TrendingUp size={16} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
              Trending
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {isTrending ? "Pinned to Homepage" : "Standard Ranking"}
            </span>
          </div>
        </div>

        <Switch
          checked={isTrending}
          onCheckedChange={handleTrendingToggle}
          className="data-[state=checked]:bg-amber-500"
        />
      </div>

    </div>
  );
}