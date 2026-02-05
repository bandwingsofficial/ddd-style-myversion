import { AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OutletConfirmModalProps {
  deleteConfirm: any | null;
  setDeleteConfirm: (val: any | null) => void;
  onConfirm: (outlet: any) => void;
}

export const OutletConfirmModal = ({ deleteConfirm, setDeleteConfirm, onConfirm }: OutletConfirmModalProps) => {
  return (
    <AnimatePresence>
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl ring-1 ring-slate-200"
          >
            <div className="mb-6 flex justify-center">
              {deleteConfirm.status === "ACTIVE" ? (
                <div className="rounded-full bg-rose-100 p-4 text-rose-500">
                  <AlertCircle size={48} strokeWidth={1.5} />
                </div>
              ) : (
                <div className="rounded-full bg-emerald-100 p-4 text-emerald-500">
                  <CheckCircle2 size={48} strokeWidth={1.5} />
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900">
              {deleteConfirm.status === "ACTIVE" ? "Deactivate Outlet?" : "Activate Outlet?"}
            </h3>
            <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed">
              Changing <strong className="text-slate-800">{deleteConfirm.name}</strong> will update its availability immediately across the platform.
            </p>
            
            <div className="mt-8 flex gap-3">
              <button 
                className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className={`
                  flex-1 rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95
                  ${deleteConfirm.status === "ACTIVE" ? "bg-rose-500 shadow-rose-200 hover:bg-rose-600" : "bg-emerald-500 shadow-emerald-200 hover:bg-emerald-600"}
                `}
                onClick={() => onConfirm(deleteConfirm)}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};