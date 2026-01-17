// features/products/components/product-toggles.tsx
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
    product.status === "ACTIVE" 
      ? await ProductsAPI.disable(product.id) 
      : await ProductsAPI.enable(product.id);
    onRefresh();
  };

  const handleTrendingToggle = async () => {
    await ProductsAPI.markTrending(product.id, !product.trendState.trending);
    onRefresh();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Active Status */}
      <div className="flex items-center justify-between gap-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
        <div className="flex items-center gap-2">
          <Power size={14} className={product.status === "ACTIVE" ? "text-emerald-500" : "text-gray-400"} />
          <span className="text-[11px] font-bold text-gray-600 uppercase">Visible</span>
        </div>
        <Switch
          checked={product.status === "ACTIVE"}
          onCheckedChange={handleStatusToggle}
        />
      </div>

      {/* Trending Status */}
      <div className="flex items-center justify-between gap-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className={product.trendState.trending ? "text-amber-500" : "text-gray-400"} />
          <span className="text-[11px] font-bold text-gray-600 uppercase">Trending</span>
        </div>
        <Switch
          checked={product.trendState.trending}
          onCheckedChange={handleTrendingToggle}
        />
      </div>
    </div>
  );
}