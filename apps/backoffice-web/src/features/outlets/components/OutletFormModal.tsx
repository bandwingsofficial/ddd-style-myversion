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
  error,
}: OutletFormModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          {/* Overlay */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6 bg-slate-50/60">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isCreateMode ? "Create New Outlet" : "Edit Outlet"}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {isCreateMode
                    ? "Register a new branch location."
                    : `ID: ${editingOutlet?.id?.slice(-6).toUpperCase()}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8">
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-xl bg-rose-50 p-4 text-xs font-medium text-rose-600">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Outlet Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Outlet Name
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    placeholder="e.g. Bengaluru"
                    value={isCreateMode ? createForm.name : editingOutlet?.name || ""}
                    onChange={(e) =>
                      isCreateMode
                        ? setCreateForm({ ...createForm, name: e.target.value })
                        : setEditingOutlet({ ...editingOutlet, name: e.target.value })
                    }
                  />
                </div>

                {/* Branch Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Branch Name
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    placeholder="e.g. B1"
                    value={isCreateMode ? createForm.branch : editingOutlet?.branch || ""}
                    onChange={(e) =>
                      isCreateMode
                        ? setCreateForm({ ...createForm, branch: e.target.value })
                        : setEditingOutlet({ ...editingOutlet, branch: e.target.value })
                    }
                  />
                </div>

                {/* Address (Full Width) */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Address
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    placeholder="Full street address"
                    value={isCreateMode ? createForm.address : editingOutlet?.address || ""}
                    onChange={(e) =>
                      isCreateMode
                        ? setCreateForm({ ...createForm, address: e.target.value })
                        : setEditingOutlet({ ...editingOutlet, address: e.target.value })
                    }
                  />
                </div>

                {/* Pincode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Pincode
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    placeholder="6-digit PIN"
                    value={isCreateMode ? createForm.pincode : editingOutlet?.pincode || ""}
                    onChange={(e) =>
                      isCreateMode
                        ? setCreateForm({ ...createForm, pincode: e.target.value })
                        : setEditingOutlet({ ...editingOutlet, pincode: e.target.value })
                    }
                  />
                </div>

                {/* Delivery Radius */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Delivery Radius (km)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    value={
                      isCreateMode
                        ? createForm.deliveryRadiusKm
                        : editingOutlet?.deliveryRadiusKm || ""
                    }
                    onChange={(e) =>
                      isCreateMode
                        ? setCreateForm({
                            ...createForm,
                            deliveryRadiusKm: e.target.value,
                          })
                        : setEditingOutlet({
                            ...editingOutlet,
                            deliveryRadiusKm: e.target.value,
                          })
                    }
                  />
                </div>

                {/* Latitude */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Latitude
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    value={isCreateMode ? createForm.latitude : editingOutlet?.latitude || ""}
                    onChange={(e) =>
                      isCreateMode
                        ? setCreateForm({ ...createForm, latitude: e.target.value })
                        : setEditingOutlet({ ...editingOutlet, latitude: e.target.value })
                    }
                  />
                </div>

                {/* Longitude */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Longitude
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    value={
                      isCreateMode ? createForm.longitude : editingOutlet?.longitude || ""
                    }
                    onChange={(e) =>
                      isCreateMode
                        ? setCreateForm({ ...createForm, longitude: e.target.value })
                        : setEditingOutlet({
                            ...editingOutlet,
                            longitude: e.target.value,
                          })
                    }
                  />
                </div>
              </div>

              {/* Camera Toggle */}
              {isCreateMode && (
                <div className="mt-6">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-emerald-500"
                      checked={createForm.cameraEnabled}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          cameraEnabled: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm font-bold text-slate-700">
                      Enable Live Camera Immediately
                    </span>
                  </label>
                </div>
              )}

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onSubmit}
                disabled={isSaving}
                className="mt-8 w-full rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-500 hover:to-emerald-700 disabled:opacity-50 uppercase tracking-wider"
              >
                {isSaving
                  ? isCreateMode
                    ? "Creating..."
                    : "Saving..."
                  : isCreateMode
                  ? "Create Outlet"
                  : "Save Changes"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
