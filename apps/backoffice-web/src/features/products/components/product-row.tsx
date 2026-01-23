"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Product } from "../types/product.types";
import { ProductsAPI } from "../services/products.api";
import { StockItemsAPI } from "@/features/stock-items/stockItems.api"; 
import { CategoriesApi } from "@/features/categories/api/categories.api"; 

import { 
  Edit3, TrendingUp, Power, PowerOff, CheckCircle2, 
  XCircle, ImageOff, Layers, Loader2, ClipboardList, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Ensure this matches your actual backend URL exactly
const API_BASE_URL = "https://api.dev.local:4000";

interface ProductRowProps {
  index: number;
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
  onAction: () => void;
  onEdit: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export function ProductRow({ 
  index, 
  product, 
  isSelected, 
  onSelect, 
  onAction, 
  onEdit, 
  onViewDetails 
}: ProductRowProps) {
  const [isPending, setIsPending] = useState(false);
  const [popup, setPopup] = useState<{ title: string; text: string; type: 'success' | 'error' } | null>(null);
  const [imgError, setImgError] = useState(false);

  // --- STATE FOR FETCHED NAMES ---
  const [stockItemName, setStockItemName] = useState<string>("--");
  const [categoryName, setCategoryName] = useState<string>("--");
  const [loadingStock, setLoadingStock] = useState(false);
  
  const isActive = product.status === "ACTIVE";
  const isTrending = product.trendState?.trending || false;

  // --- 1. FETCH LINKED STOCK ITEM NAME ---
  useEffect(() => {
    const fetchLinkedStockItem = async () => {
      const linkedId = (product as any).stockItemId || product.stockItemId;

      if (!linkedId) {
        setStockItemName("--");
        return;
      }

      if ((product as any).stockItem?.name) {
        setStockItemName((product as any).stockItem.name);
        return;
      }

      try {
        setLoadingStock(true);
        const res = await StockItemsAPI.getById(linkedId);
        const itemData = res || {};
        const name = itemData.name || "Unknown Item"; 
        setStockItemName(name);
      } catch (err) {
        console.error("Failed to fetch linked stock item:", err);
        setStockItemName("Error");
      } finally {
        setLoadingStock(false);
      }
    };

    fetchLinkedStockItem();
  }, [product.stockItemId]); 

  // --- 2. FETCH CATEGORY NAME ---
  useEffect(() => {
    const fetchCategoryName = async () => {
       if (!product.categoryId) {
         setCategoryName("--");
         return;
       }

       if ((product as any).category?.name) {
          setCategoryName((product as any).category.name);
          return;
       }

       try {
          const res = await CategoriesApi.getById(product.categoryId);
          const catData = res || {}; 
          setCategoryName(catData.name || "Unknown");
       } catch (err) {
          console.error("Failed to fetch category:", err);
          setCategoryName(product.categoryId.substring(0, 6) + "...");
       }
    };

    fetchCategoryName();
  }, [product.categoryId]);

  // --- IMAGE LOGIC ---
  const getImageUrl = () => {
    if (!product.images) return null;
    let path = "";
    if (typeof product.images === 'string') {
      path = product.images;
    } else {
      const imgs = product.images as any;
      path = imgs.mainImage || imgs.url || (Array.isArray(imgs) ? imgs[0] : "");
    }

    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('https')) return path;

    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const imageUrl = getImageUrl();
  
  useEffect(() => { setImgError(false); }, [product.id]);

  // --- TOGGLES ---
  const handleStatusToggle = async () => {
    try {
      setIsPending(true);
      if (isActive) await ProductsAPI.disable(product.id);
      else await ProductsAPI.enable(product.id);
      onAction(); 
    } catch (err) { 
      setPopup({ title: "ERROR", text: "Failed to update status.", type: 'error' });
    } finally { setIsPending(false); }
  };

  const handleTrendingToggle = async () => {
    try {
      setIsPending(true);
      await ProductsAPI.markTrending(product.id, !isTrending);
      onAction(); 
    } catch (err) {
      setPopup({ title: "ERROR", text: "Failed to update trending status.", type: 'error' });
    } finally { setIsPending(false); }
  };

  return (
    <>
      <tr 
        className={`
          group border-b border-border transition-all duration-200
          ${isSelected ? "bg-emerald-50/50" : "hover:bg-muted/30"}
          ${!isActive ? "bg-slate-50/50 opacity-75 grayscale-[0.5] hover:grayscale-0 hover:opacity-100" : "bg-white"}
        `}
      >
        {/* Checkbox */}
        <td className="px-6 py-4 align-middle">
          <div className="flex justify-center">
            <input 
              type="checkbox" 
              checked={isSelected} 
              onChange={onSelect} 
              className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-primary focus:ring-primary/20" 
            />
          </div>
        </td>
        
        {/* Product Name & Image */}
        <td className="px-6 py-4 align-middle">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {imageUrl && !imgError ? (
                <img 
                  src={imageUrl} 
                  alt={product.name.value} 
                  onError={() => setImgError(true)} 
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" 
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <ImageOff size={18} />
                </div>
              )}
            </div>
            <div className="flex flex-col">
               <span 
                 onClick={() => onViewDetails(product)}
                 className="cursor-pointer text-sm font-semibold text-foreground transition-colors hover:text-primary hover:underline"
               >
                  {product.name.value}
               </span>
               <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                 {product.unitValue} {product.unitType}
               </span>
            </div>
          </div>
        </td>
        
        {/* Category */}
        <td className="px-6 py-4 align-middle">
             <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <Layers size={14} className="text-slate-400" />
                <span title={product.categoryId} className="truncate max-w-[120px]">
                  {categoryName}
                </span>
             </div>
        </td>

        {/* Stock Item Name */}
        <td className="px-6 py-4 align-middle">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
             <ClipboardList size={14} className="text-slate-400" />
             <span className="truncate max-w-[120px]">
                {loadingStock ? (
                  <span className="animate-pulse text-slate-400">Loading...</span>
                ) : (
                  stockItemName
                )}
             </span>
          </div>
        </td>
        
        {/* Status Badge */}
        <td className="px-6 py-4 align-middle">
          <div className="flex justify-center">
            <div className={`
              inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide border
              ${isActive 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                : "bg-slate-100 text-slate-500 border-slate-200"
              }
            `}>
              <div className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              {isActive ? "ACTIVE" : "INACTIVE"}
            </div>
          </div>
        </td>
        
        {/* Trending Toggle */}
        <td className="px-6 py-4 align-middle">
          <div className="flex justify-center">
            <button 
                onClick={handleTrendingToggle}
                disabled={isPending}
                title={isTrending ? "Remove from Trending" : "Mark as Trending"}
                className={`
                  flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200
                  ${isTrending 
                    ? "bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100" 
                    : "bg-transparent border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  }
                  ${isPending ? "cursor-not-allowed opacity-50" : "cursor-pointer active:scale-95"}
                `}
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} fill={isTrending ? "currentColor" : "none"} />}
            </button>
          </div>
        </td>
        
        {/* Price */}
        <td className="px-6 py-4 align-middle">
            <div className="flex flex-col items-end gap-0.5">
                <span className="text-sm font-bold text-slate-700">₹{product.price.originalPrice}</span>
                {product.price.discountPrice && product.price.discountPrice > 0 && (
                     <div className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                       Save ₹{product.price.discountPrice}
                     </div>
                )}
            </div>
        </td>
        
        {/* Actions */}
        <td className="px-6 py-4 align-middle text-right">
          <div className="flex items-center justify-end gap-2">
            <button 
                onClick={handleStatusToggle} 
                disabled={isPending} 
                className={`
                  flex h-8 w-8 items-center justify-center rounded-lg transition-colors
                  ${isActive 
                    ? "bg-rose-50 text-rose-500 hover:bg-rose-100" 
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  }
                  disabled:opacity-50
                `}
                title={isActive ? "Disable Product" : "Enable Product"}
            >
              {isActive ? <PowerOff size={16} /> : <Power size={16} />}
            </button>
            <button 
              onClick={() => onEdit(product)} 
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
              title="Edit Product"
            >
              <Edit3 size={16} />
            </button>
          </div>
        </td>
      </tr>

      {/* Popups (Using Portal & Tailwind) */}
      {createPortal(
        <AnimatePresence>
          {popup && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 10 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 10 }} 
                className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 text-center"
              >
                <div className="mb-4 flex justify-center">
                  {popup.type === 'success' ? (
                    <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                       <CheckCircle2 size={40} />
                    </div>
                  ) : (
                    <div className="rounded-full bg-rose-100 p-3 text-rose-600">
                       <AlertCircle size={40} />
                    </div>
                  )}
                </div>
                <h3 className={`text-lg font-bold ${popup.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
                   {popup.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500">{popup.text}</p>
                <button 
                   onClick={() => setPopup(null)} 
                   className={`mt-6 w-full rounded-xl py-3 text-sm font-bold text-white shadow-md transition-transform active:scale-95 ${
                     popup.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-800 hover:bg-slate-900'
                   }`}
                >
                   {popup.type === 'success' ? 'Continue' : 'Close'}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}