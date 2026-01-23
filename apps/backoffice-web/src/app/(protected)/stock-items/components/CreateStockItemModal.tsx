'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Layers, AlertCircle } from 'lucide-react';
import { StockItemsAPI } from '@/features/stock-items/stockItems.api';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateStockItemModal({ open, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('PIECE');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) {
        setFormError("Item name is required");
        return;
    }
    
    setFormError(null);
    setIsSaving(true);
    
    try {
      await StockItemsAPI.create({ name: name.trim(), unit: unit as any });
      onSuccess();
      handleClose(); 
    } catch (err: any) {
      if (err.response?.status === 409 || err.response?.data?.message?.includes('exists')) {
        setFormError(`"${name}" already exists in the inventory.`);
      } else {
        setFormError("An error occurred. This item might already exist.");
      }
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setFormError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={handleClose} />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create Stock Item</h2>
                <p className="text-xs font-medium text-slate-500 mt-1">Add new raw materials to inventory</p>
              </div>
              <button 
                onClick={handleClose} 
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20}/>
              </button>
            </div>

            {/* --- FORM BODY --- */}
            <div className="p-8">
              
              {/* Error Banner */}
              <AnimatePresence>
                {formError && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0, marginBottom: 0 }} 
                    animate={{ height: 'auto', opacity: 1, marginBottom: 24 }} 
                    exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-4 text-xs font-medium text-rose-600 ring-1 ring-rose-100">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <p>{formError}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-5">
                
                {/* Name Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Item Name <span className="text-rose-500">*</span></label>
                  <div className="relative flex items-center">
                    <Package size={18} className="absolute left-3.5 text-slate-400" />
                    <input 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      placeholder="e.g. Tomato Sauce" 
                      value={name} 
                      onChange={(e) => {
                          setName(e.target.value);
                          if(formError) setFormError(null);
                      }} 
                    />
                  </div>
                </div>

                {/* Unit Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Measurement Unit <span className="text-rose-500">*</span></label>
                  <div className="relative flex items-center">
                    <Layers size={18} className="absolute left-3.5 text-slate-400" />
                    <select 
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
                      value={unit} 
                      onChange={e => setUnit(e.target.value)}
                    >
                      <option value="PIECE">Piece (Pcs)</option>
                      <option value="KG">Kilogram (Kg)</option>
                      <option value="LITER">Liter (Ltr)</option>
                      <option value="PACKET">Packet</option>
                      <option value="ML">Milliliter (ml)</option>
                      <option value="GRAM">Gram (g)</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 w-full rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-emerald-300 hover:from-emerald-500 hover:to-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
                  onClick={submit} 
                  disabled={isSaving}
                >
                  {isSaving ? "Creating..." : "Create Item"}
                </motion.button>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}