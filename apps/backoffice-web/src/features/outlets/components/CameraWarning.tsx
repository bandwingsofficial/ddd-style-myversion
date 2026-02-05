"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

export const CameraWarning = ({ message, onClose }: { message: string | null; onClose: () => void }) => (
  <AnimatePresence>
    {message && (
      <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white shadow-xl shadow-slate-900/20 ring-1 ring-white/10"
        >
          <AlertCircle size={18} className="text-amber-400" />
          <span>{message}</span>
          <button onClick={onClose} className="ml-2 rounded-full p-1 hover:bg-white/20">
            <X size={14}/>
          </button>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);