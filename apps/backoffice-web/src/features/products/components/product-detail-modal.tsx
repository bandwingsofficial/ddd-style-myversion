"use client";

import { useEffect, useState } from "react";
import { ProductsAPI } from "../services/products.api";
import { Product } from "../types/product.types";
import { X, Calendar, Tag, TrendingUp, Package, Layers, Info, DollarSign, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE_URL = "https://api.dev.local:4000";

export default function ProductDetailModal({ productId, onClose }: { productId: string, onClose: () => void }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProductsAPI.fetchById(productId)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading || !product) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  // Helper to fix image URL
  const getFullImgUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const mainImageSrc = getFullImgUrl(product.images.mainImage);

  return (
    // 1. OVERLAY
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      
      {/* 2. MODAL CARD */}
      <motion.div 
        initial={{ y: 20, opacity: 0, scale: 0.98 }} 
        animate={{ y: 0, opacity: 1, scale: 1 }} 
        className="w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden rounded-3xl bg-background shadow-2xl ring-1 ring-border"
        onClick={e => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Product Insights</h2>
              <p className="text-xs text-muted-foreground">Detailed view of inventory item</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* HERO SECTION (Image + Basic Info) */}
          <div className="flex flex-col md:flex-row gap-6 mb-8 border-b border-dashed border-border pb-8">
            
            {/* Main Image */}
            <div className="shrink-0">
              <div className="relative h-40 w-40 overflow-hidden rounded-2xl border border-border bg-muted/30">
                {mainImageSrc ? (
                  <img src={mainImageSrc} className="h-full w-full object-cover" alt={product.name.value} />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>
            </div>

            {/* Title & Price */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-foreground leading-tight">{product.name.value}</h1>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {product.unitValue} {product.unitType}
                  </p>
                </div>
                {product.trendState.trending && (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-700 shadow-sm dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-500">
                    <TrendingUp size={12} /> TRENDING
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-primary">
                  ₹{(product.price.originalPrice - (product.price.discountPrice ?? 0))}
                </span>
                {(product.price.discountPrice ?? 0) > 0 && (
                  <>
                    <span className="text-lg font-medium text-muted-foreground line-through decoration-muted-foreground/50">
                      ₹{product.price.originalPrice}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                      Save ₹{product.price.discountPrice}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Classification Card */}
            <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-3">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Layers size={14} /> Classification
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category ID:</span>
                  <span className="font-mono font-medium text-foreground">{product.categoryId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stock ID:</span>
                  <span className="font-mono font-medium text-foreground">{product.stockItemId}</span>
                </div>
              </div>
            </div>

            {/* Tags & Status Card */}
            <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-3">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Tag size={14} /> Details
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.tags && product.tags.length > 0 ? product.tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center rounded-md border border-border bg-background px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground shadow-sm">
                    {tag}
                  </span>
                )) : (
                  <span className="text-xs text-muted-foreground italic">No tags</span>
                )}
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between">
                 <span className="text-xs font-medium text-muted-foreground">Status</span>
                 <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${product.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'}`} />
                    {product.status}
                 </span>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="rounded-2xl border border-border p-5 mb-8">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              <Info size={14} /> Description
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-foreground bg-muted/50 px-1.5 py-0.5 rounded mr-2">Short</span>
                <span className="text-sm text-muted-foreground">{product.shortDescription || "No short description."}</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {product.longDescription || "No detailed description available."}
              </p>
            </div>
          </div>

          {/* GALLERY */}
          {product.images.galleryImages && product.images.galleryImages.length > 0 && (
            <div className="mb-8">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                <ImageIcon size={14} /> Gallery
              </h4>
              <div className="flex flex-wrap gap-3">
                {product.images.galleryImages.map((img, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-border bg-muted/10">
                    <img src={getFullImgUrl(img)} className="h-full w-full object-cover transition-transform hover:scale-110" alt="Gallery" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER TIMESTAMPS */}
          <div className="flex items-center justify-between border-t border-border pt-6 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} /> 
              Created: <span className="text-foreground">{formatDate(product.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} /> 
              Updated: <span className="text-foreground">{formatDate(product.updatedAt)}</span>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}