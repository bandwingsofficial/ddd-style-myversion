"use client";

import React, { useState } from "react";
import { InventoryItem } from "../types/inventory.types";
import { InventoryAPI } from "../api/inventory.api";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, AlertCircle, CheckCircle, Loader2, Calculator } from "lucide-react";

interface Props {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdjustStockModal({ item, onClose, onSuccess }: Props) {
  // Logic: User enters the amount they want to subtract from the current available balance
  const [adjustmentAmt, setAdjustmentAmt] = useState<number | ''>(0);
  const [remarks, setRemarks] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const val = Number(adjustmentAmt);
    
    // Calculation logic: Current Available - Adjustment Amount
    const newAvailable = item.availableQty.value - val;

    // Validation
    if (val <= 0) {
      setFormError("Please enter a positive adjustment amount to deduct.");
      return;
    }

    if (newAvailable < 0) {
      setFormError(`Insufficient available stock. You only have ${item.availableQty.value} available.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      await InventoryAPI.adjustStock({ 
        stockItemId: item.stockItemId, 
        newAvailableQty: newAvailable, 
        remarks: remarks.trim() || `Deducted ${val} from available stock`
      });

      setIsSuccess(true);
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save adjustment.");
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Adjust Stock</h2>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <X size={20}/>
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-col gap-6">
          
          {/* FEEDBACK BANNERS */}
          <AnimatePresence mode="wait">
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
                <span>Stock adjusted successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUMMARY BOX (Live Calculation) */}
          <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Total Stock:</span>
              <span className="font-bold text-foreground">{item.totalQty.value} {item.unit}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Current Available:</span>
              <span className="font-bold text-foreground">{item.availableQty.value} {item.unit}</span>
            </div>
            
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calculator size={14} className="text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Balance</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {item.availableQty.value - Number(adjustmentAmt)} {item.unit}
              </span>
            </div>
          </div>

          {/* FORM INPUTS */}
          <div className="space-y-4">
            
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Amount to Subtract
              </label>
              <input 
                type="number" 
                disabled={isSuccess || isSubmitting}
                value={adjustmentAmt} 
                onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setAdjustmentAmt(val);
                    if (formError) setFormError(null);
                }}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-lg font-bold outline-none transition-all placeholder:font-normal placeholder:text-muted-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
              />
            </div>

            {/* Remarks Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Remarks / Reason
              </label>
              <textarea 
                disabled={isSuccess || isSubmitting}
                placeholder="e.g. Spillage, expiry, or internal usage" 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full min-h-[80px] rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 resize-none"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            disabled={isSuccess || isSubmitting}
            onClick={submit} 
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle size={18} />
                Done
              </>
            ) : (
              "Confirm Adjustment"
            )}
          </button>

        </div>
      </motion.div>
    </div>
  );
}