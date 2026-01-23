'use client';

import { useState } from "react";
import { InventoryItem } from "../types/inventory.types";
import { InventoryAPI } from "../api/inventory.api";
import { X, PlusCircle, Package, Loader2 } from "lucide-react";

// Local interface extension to handle the stockName we added in the hook
interface MergedItem extends InventoryItem {
  stockName?: string;
}

interface Props {
  item: MergedItem; // Using merged item to get access to stockName
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStockModal({ item, onClose, onSuccess }: Props) {
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    // Prevent submitting 0 or negative
    if (quantity <= 0) return;

    setLoading(true);
    try {
      await InventoryAPI.addStock({ 
        stockItemId: item.stockItemId, 
        quantity 
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to add stock", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. OVERLAY
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 2. MODAL CARD */}
      <div 
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-background p-8 shadow-2xl ring-1 ring-border animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PlusCircle size={22} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Add Stock</h2>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-col gap-6">
          
          {/* ITEM INFO CARD */}
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-4">
            <Package size={18} className="text-muted-foreground" />
            <div className="flex flex-col">
               <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item Name</span>
               <span className="text-sm font-bold text-foreground">{item.stockName || item.stockItemId}</span>
            </div>
          </div>
          
          {/* INPUT GROUP */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quantity to Add ({item.unit})
            </label>
            <div className="relative">
              <input 
                type="number" 
                autoFocus
                value={quantity || ''} 
                onChange={(e) => setQuantity(+e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="0"
                min="1"
                className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-lg font-bold text-foreground outline-none transition-all placeholder:font-normal placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              {/* Optional: Add unit inside input */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground pointer-events-none">
                {item.unit}
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            onClick={submit} 
            disabled={loading || quantity <= 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Addition"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}