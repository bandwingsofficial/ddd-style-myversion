"use client";

import { useState, useEffect } from "react";
import { InventoryAPI } from "../api/inventory.api";
import { X, Box, Layers, Truck, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface StockItem {
  id: string;
  name: string;
  unit: string;
  status: string;
}

export default function InitializeInventoryModal({ onClose, onSuccess }: Props) {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockItemId, setStockItemId] = useState("");
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [fetchingStocks, setFetchingStocks] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // 1. Fetch stock items and filter for only ACTIVE ones
  useEffect(() => {
    const loadStocks = async () => {
      try {
        const res = await InventoryAPI.getAllStockItems();
        const activeStocks = res.data.data.filter((item: StockItem) => item.status === "ACTIVE");
        setStockItems(activeStocks);
      } catch (err) {
        setFormError("Failed to load stock items list.");
      } finally {
        setFetchingStocks(false);
      }
    };
    loadStocks();
  }, []);

  // 2. Handle Stock Selection Change
  const handleStockChange = (id: string) => {
    setStockItemId(id);
    setFormError(null);

    const selectedItem = stockItems.find((item) => item.id === id);
    if (selectedItem) {
      setUnit(selectedItem.unit);
    } else {
      setUnit("");
    }
  };

  const submit = async () => {
    if (!stockItemId) {
      setFormError("Please select a Stock Item");
      return;
    }
    
    // Convert to number for API, default to 0 if empty
    const qtyValue = Number(quantity);

    setLoading(true);
    setFormError(null);

    try {
      await InventoryAPI.initialize({
        stockItemId,
        unit,
        quantity: qtyValue,
      });

      onSuccess(); 
      onClose();   
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to initialize inventory";
      const errorCode = err.response?.data?.code;

      if (errorCode === "INVENTORY_ALREADY_EXISTS") {
        setFormError("Inventory already initialized for this stock item.");
      } else {
        setFormError(errorMessage);
      }
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-background p-8 shadow-2xl ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Initialize Inventory</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Set initial stock levels for a raw material.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <X size={20}/>
          </button>
        </div>

        {/* FORM */}
        <div className="flex flex-col gap-5">
          
          <AnimatePresence>
            {formError && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive"
              >
                <AlertCircle size={18} />
                <span>{formError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STOCK ITEM DROPDOWN */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Select Stock Item <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Truck size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select
                value={stockItemId}
                onChange={(e) => handleStockChange(e.target.value)}
                disabled={fetchingStocks}
                className="w-full appearance-none rounded-xl border border-input bg-background py-3 pl-11 pr-4 text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50"
              >
                <option value="">{fetchingStocks ? "Loading..." : "-- Select Item --"}</option>
                {stockItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {/* Custom Arrow for select */}
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1l4 4 4-4"/></svg>
              </div>
            </div>
          </div>

          {/* UNIT DISPLAY (READ-ONLY) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Measurement Unit <span className="text-[10px] font-normal normal-case">(Auto-filled)</span>
            </label>
            <div className="relative">
              <Layers size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
              <input
                value={unit || "Select an item first"}
                readOnly
                className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-11 pr-4 text-sm font-medium text-muted-foreground outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* QUANTITY INPUT */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Initial Quantity <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Box size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                min="0"
                className="w-full rounded-xl border border-input bg-background py-3 pl-11 pr-4 text-sm font-bold text-foreground outline-none transition-all placeholder:font-normal focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 mt-2">
            <button 
              onClick={onClose} 
              disabled={loading}
              className="flex-1 rounded-xl border border-input bg-background py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={submit} 
              disabled={loading || fetchingStocks || !stockItemId} 
              className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Initializing..." : "Initialize Stock"}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}