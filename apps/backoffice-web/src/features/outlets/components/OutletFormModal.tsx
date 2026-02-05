import { X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OutletFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCreateMode: boolean;
  editingOutlet: any | null;
  createForm: any;
  setCreateForm: (data: any) => void;
  setEditingOutlet: (data: any) => void;
  onSubmit: () => void;
  isSaving: boolean;
  error: string | null;
}

export const OutletFormModal = ({
  isOpen,
  onClose,
  isCreateMode,
  editingOutlet,
  createForm,
  setCreateForm,
  setEditingOutlet,
  onSubmit,
  isSaving,
  error
}: OutletFormModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={onClose} />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isCreateMode ? "Create New Outlet" : "Edit Outlet"}
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {isCreateMode ? "Register a new branch location." : `ID: ${editingOutlet?.id?.slice(-6).toUpperCase()}`}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20}/>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8">
                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl bg-rose-50 p-4 text-xs font-medium text-rose-600">
                     <AlertCircle size={16} className="shrink-0 mt-0.5" />
                     <p>{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-5">
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Outlet Name</label>
                      <input 
                         className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                         placeholder="e.g. Bengaluru" 
                         value={isCreateMode ? createForm.name : editingOutlet?.name || ""} 
                         onChange={(e) => isCreateMode ? setCreateForm({...createForm, name: e.target.value}) : setEditingOutlet({...editingOutlet, name: e.target.value})} 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Branch Code</label>
                      <input 
                         className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                         placeholder="e.g. B1" 
                         value={isCreateMode ? createForm.branch : editingOutlet?.branch || ""} 
                         onChange={(e) => isCreateMode ? setCreateForm({...createForm, branch: e.target.value}) : setEditingOutlet({...editingOutlet, branch: e.target.value})} 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Latitude</label>
                      <input 
                         type="number"
                         className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                         value={isCreateMode ? createForm.latitude : editingOutlet?.latitude || ""} 
                         onChange={(e) => isCreateMode ? setCreateForm({...createForm, latitude: e.target.value}) : setEditingOutlet({...editingOutlet, latitude: e.target.value})} 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Longitude</label>
                      <input 
                         type="number"
                         className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                         value={isCreateMode ? createForm.longitude : editingOutlet?.longitude || ""} 
                         onChange={(e) => isCreateMode ? setCreateForm({...createForm, longitude: e.target.value}) : setEditingOutlet({...editingOutlet, longitude: e.target.value})} 
                      />
                   </div>
                   <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Delivery Radius (km)</label>
                      <input 
                         type="number"
                         className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                         value={isCreateMode ? createForm.deliveryRadiusKm : editingOutlet?.deliveryRadiusKm || ""} 
                         onChange={(e) => isCreateMode ? setCreateForm({...createForm, deliveryRadiusKm: e.target.value}) : setEditingOutlet({...editingOutlet, deliveryRadiusKm: e.target.value})} 
                      />
                   </div>
                </div>

                {isCreateMode && (
                   <div className="mt-6 flex items-center">
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50 w-full">
                         <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-slate-300 accent-emerald-500 focus:ring-emerald-500/20"
                            checked={createForm.cameraEnabled} 
                            onChange={e => setCreateForm({...createForm, cameraEnabled: e.target.checked})} 
                         />
                         <span className="text-sm font-bold text-slate-700">Enable Live Camera Immediately</span>
                      </label>
                   </div>
                )}

                <motion.button 
                   whileTap={{ scale: 0.98 }}
                   className="mt-8 w-full rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-emerald-300 hover:from-emerald-500 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                   onClick={onSubmit}
                   disabled={isSaving}
                >
                   {isSaving ? (isCreateMode ? "Creating..." : "Saving...") : (isCreateMode ? "Create Outlet" : "Save Changes")}
                </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};