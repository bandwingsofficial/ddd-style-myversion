"use client";

import React, { useState, useEffect } from "react";
import { InventoryItem } from "../types/inventory.types";
import { InventoryAPI } from "../api/inventory.api";
import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, AlertCircle, CheckCircle, Package, Store, Loader2, ArrowRight } from "lucide-react";

interface Props {
  item: InventoryItem & { stockName?: string }; // Include stockName for display
  onClose: () => void;
  onSuccess: () => void;
}

interface Outlet {
  id: string;
  name: string;
  branch: string;
  status: string;
}

export default function TransferStockModal({ item, onClose, onSuccess }: Props) {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [outletId, setOutletId] = useState("");
  const [quantity, setQuantity] = useState<number | ''>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOutlets, setIsLoadingOutlets] = useState(true);

  // Fetch outlets on component mount
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const res = await InventoryAPI.getAllOutlets();
        // Filter to show only ACTIVE outlets
        const activeOutlets = res.data.data.filter((o: Outlet) => o.status === "ACTIVE");
        setOutlets(activeOutlets);
      } catch (err) {
        setFormError("Failed to load destination outlets.");
      } finally {
        setIsLoadingOutlets(false);
      }
    };
    fetchOutlets();
  }, []);

  const submit = async () => {
    const qtyVal = Number(quantity);

    if (!outletId) {
      setFormError("Please select a destination outlet.");
      return;
    }
    if (qtyVal <= 0) {
      setFormError("Quantity must be greater than 0.");
      return;
    }
    if (qtyVal > item.availableQty.value) {
        setFormError(`Insufficient stock. Max transfer is ${item.availableQty.value} ${item.unit}.`);
        return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      
      await InventoryAPI.transferStock({ 
        stockItemId: item.stockItemId, 
        outletId: outletId, 
        quantity: qtyVal 
      });

      setIsSuccess(true);
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to process transfer.");
      setIsSubmitting(false);
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
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="w-full max-w-md overflow-hidden rounded-3xl bg-background p-8 shadow-2xl ring-1 ring-border"
        onClick={e => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Truck size={20} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-foreground">Transfer Stock</h2>
               <p className="text-xs text-muted-foreground">Move inventory to an outlet</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <X size={20}/>
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-col gap-6">
          
          {/* ITEM DISPLAY */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-border text-muted-foreground">
                  <Package size={16} />
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item Name</span>
                  <span className="text-sm font-bold text-foreground">{item.stockName || item.stockItemId}</span>
               </div>
            </div>
            <div className="text-right">
               <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Available</span>
               <div className="text-sm font-bold text-foreground">{item.availableQty.value} {item.unit}</div>
            </div>
          </div>

          {/* FEEDBACK BANNERS */}
          <AnimatePresence>
            {formError && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive"
              >
                <AlertCircle size={18} />
                <span>{formError}</span>
              </motion.div>
            )}
            {isSuccess && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm font-medium text-green-600"
              >
                <CheckCircle size={18} />
                <span>Stock transferred successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORM INPUTS */}
          <div className="space-y-4">
            
            {/* DESTINATION OUTLET */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Destination Outlet <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Store size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <select 
                  disabled={isSuccess || isSubmitting || isLoadingOutlets}
                  value={outletId} 
                  onChange={(e) => {
                    setOutletId(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="w-full appearance-none rounded-xl border border-input bg-background py-3 pl-11 pr-4 text-sm font-medium text-foreground outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 disabled:opacity-50"
                >
                  <option value="">{isLoadingOutlets ? "Loading..." : "-- Select Outlet --"}</option>
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} {o.branch ? `(${o.branch})` : ''}
                    </option>
                  ))}
                </select>
                {/* Arrow Icon */}
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                   <ArrowRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* QUANTITY INPUT */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quantity to Transfer ({item.unit})
              </label>
              <input 
                type="number" 
                disabled={isSuccess || isSubmitting}
                value={quantity} 
                onChange={(e) => {
                  setQuantity(e.target.value === '' ? '' : Number(e.target.value));
                  if (formError) setFormError(null);
                }} 
                placeholder="0"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-lg font-bold text-foreground outline-none transition-all placeholder:font-normal placeholder:text-muted-foreground focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 disabled:opacity-50"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            disabled={isSuccess || isSubmitting || isLoadingOutlets} 
            onClick={submit} 
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-600 hover:shadow-amber-500/40 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? (
               <>
                 <Loader2 size={18} className="animate-spin" />
                 Processing...
               </>
            ) : isSuccess ? (
               <>
                 <CheckCircle size={18} />
                 Success
               </>
            ) : (
               "Process Transfer"
            )}
          </button>
        </div>

      </motion.div>
    </div>
  );
}