"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Package, RefreshCw, Power, PowerOff, 
  CheckCircle2, AlertTriangle, Trash2 
} from "lucide-react";

import { Product } from "../types/product.types";
import { ProductsAPI } from "../services/products.api";
import { ProductRow } from "./product-row";
import EditProductModal from "./edit-product-dialog";
import ProductDetailModal from "./product-detail-modal";

interface TableProps {
  products: Product[];
  loading: boolean;
  refresh: () => void;
}

export function ProductsTable({ products, loading, refresh }: TableProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Flash Message Logic
  const [flashMessage, setFlashMessage] = useState<{ 
    title: string; 
    text: string; 
    type: 'success' | 'warning' | 'error';
    onConfirm?: () => void;
  } | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <RefreshCw size={40} className="animate-spin text-emerald-500 mb-4" />
        <p className="text-sm font-semibold text-slate-500">Syncing Catalog...</p>
      </div>
    );
  }

  const selectedProducts = products.filter(p => selectedIds.includes(p.id));
  const hasActiveSelected = selectedProducts.some(p => p.status === "ACTIVE");
  const hasInactiveSelected = selectedProducts.some(p => p.status !== "ACTIVE");
  const isMixedSelection = hasActiveSelected && hasInactiveSelected;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? products.map((p) => p.id) : []);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const targetProduct = products.find(p => p.id === id);
      if (!targetProduct) return prev;
      
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      return [...prev, id];
    });
  };

  const handleBulkStatus = (action: 'enable' | 'disable') => {
    if (selectedIds.length === 0) return;
    
    setFlashMessage({
      type: 'warning',
      title: 'Confirm Bulk Action',
      text: `Are you sure you want to ${action} ${selectedIds.length} selected products?`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => action === 'enable' ? ProductsAPI.enable(id) : ProductsAPI.disable(id)));
          setSelectedIds([]);
          refresh();
          setFlashMessage({
            type: 'success',
            title: 'Action Successful',
            text: `Selected products have been ${action === 'enable' ? 'activated' : 'deactivated'}.`
          });
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
             <Package size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Product Overview</h3>
            <p className="text-xs text-slate-400 font-medium">Manage your inventory list</p>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="text-xs font-bold text-slate-400 mr-2">
                {selectedIds.length} Selected
              </span>
              
              {(hasInactiveSelected || isMixedSelection) && (
                <button 
                  onClick={() => handleBulkStatus('enable')} 
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-95 shadow-sm shadow-emerald-200"
                >
                  <Power size={14} /> Enable
                </button>
              )}
              
              {(hasActiveSelected || isMixedSelection) && (
                <button 
                  onClick={() => handleBulkStatus('disable')} 
                  className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-rose-600 active:scale-95 shadow-sm shadow-rose-200"
                >
                  <PowerOff size={14} /> Disable
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="px-6 py-4 w-[40px] text-center align-middle">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll} 
                  checked={selectedIds.length === products.length && products.length > 0} 
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-emerald-500 focus:ring-emerald-500/20"
                />
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Product</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Item Name</th>
              <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Trending</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Price</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {products.length > 0 ? (
              products.map((product, index) => (
                <ProductRow 
                  key={product.id} 
                  index={index} 
                  product={product} 
                  isSelected={selectedIds.includes(product.id)}
                  onSelect={() => handleToggleSelect(product.id)}
                  onAction={refresh} 
                  onEdit={setEditingProduct} 
                  onViewDetails={setViewingProduct}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Package size={48} className="mb-4 text-slate-300" />
                    <p className="text-sm font-medium">No products found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {editingProduct && (
          <EditProductModal 
            product={editingProduct} 
            onClose={() => setEditingProduct(null)} 
            onSuccess={() => { refresh(); setEditingProduct(null); }} 
          />
        )}
        {viewingProduct && (
          <ProductDetailModal 
            productId={viewingProduct.id} 
            onClose={() => setViewingProduct(null)} 
          />
        )}
        {flashMessage && (
          <FlashMessage {...flashMessage} onClose={() => setFlashMessage(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- FLASH MESSAGE COMPONENT ---
function FlashMessage({ title, text, type, onClose, onConfirm }: any) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }} 
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl ring-1 ring-slate-200"
      >
        <div className="mb-6 flex justify-center">
          {type === 'success' && (
            <div className="rounded-full bg-emerald-100 p-4 text-emerald-500 shadow-sm">
               <CheckCircle2 size={48} />
            </div>
          )}
          {(type === 'warning' || type === 'error') && (
            <div className={`rounded-full p-4 shadow-sm ${type === 'warning' ? 'bg-amber-100 text-amber-500' : 'bg-rose-100 text-rose-500'}`}>
               <AlertTriangle size={48} />
            </div>
          )}
        </div>
        
        <h3 className={`text-xl font-extrabold tracking-tight ${
           type === 'warning' ? 'text-amber-600' : 
           type === 'error' ? 'text-rose-600' : 
           'text-emerald-600'
        }`}>
           {title}
        </h3>
        
        <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">
          {text}
        </p>
        
        <div className="mt-8 flex gap-3">
          {onConfirm && (
            <button 
              onClick={() => { onConfirm(); onClose(); }} 
              className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-md shadow-emerald-200 transition-all hover:bg-emerald-600 hover:shadow-lg active:scale-95"
            >
              Confirm
            </button>
          )}
          <button 
            onClick={onClose} 
            className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all active:scale-95 ${
              onConfirm 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                : 'bg-slate-800 text-white shadow-md shadow-slate-400/50 hover:bg-slate-900'
            }`}
          >
            {onConfirm ? 'Cancel' : 'Continue'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}