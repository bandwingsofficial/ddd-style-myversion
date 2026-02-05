"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";

interface ModalsProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (val: boolean) => void;
  editingOutlet: any;
  setEditingOutlet: (val: any) => void;
  createForm: any;
  setCreateForm: (val: any) => void;
  formError: string | null;
  isSaving: boolean;
  handleCreateSubmit: () => void;
  handleEditSave: () => void;
  deleteConfirm: any;
  setDeleteConfirm: (val: any) => void;
  toggleOutletStatus: (o: any) => void;
}

export const OutletModals = ({ 
  isCreateModalOpen, setIsCreateModalOpen, editingOutlet, setEditingOutlet, 
  createForm, setCreateForm, formError, isSaving, handleCreateSubmit, handleEditSave,
  deleteConfirm, setDeleteConfirm, toggleOutletStatus 
}: ModalsProps) => (
  <>
    <AnimatePresence>
      {(isCreateModalOpen || editingOutlet) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => { setIsCreateModalOpen(false); setEditingOutlet(null); }} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">{isCreateModalOpen ? "Create New Outlet" : "Edit Outlet"}</h2>
              <button onClick={() => { setIsCreateModalOpen(false); setEditingOutlet(null); }} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X size={20}/></button>
            </div>
            <div className="p-8">
              {formError && <div className="mb-6 flex items-start gap-3 rounded-xl bg-rose-50 p-4 text-xs font-medium text-rose-600"><AlertCircle size={16}/>{formError}</div>}
              <div className="grid grid-cols-2 gap-5">
                <input className="col-span-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Name" value={isCreateModalOpen ? createForm.name : editingOutlet?.name} onChange={(e) => isCreateModalOpen ? setCreateForm({...createForm, name: e.target.value}) : setEditingOutlet({...editingOutlet, name: e.target.value})} />
                <input className="col-span-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Branch" value={isCreateModalOpen ? createForm.branch : editingOutlet?.branch} onChange={(e) => isCreateModalOpen ? setCreateForm({...createForm, branch: e.target.value}) : setEditingOutlet({...editingOutlet, branch: e.target.value})} />
                <input type="number" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Lat" value={isCreateModalOpen ? createForm.latitude : editingOutlet?.latitude} onChange={(e) => isCreateModalOpen ? setCreateForm({...createForm, latitude: e.target.value}) : setEditingOutlet({...editingOutlet, latitude: e.target.value})} />
                <input type="number" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Lng" value={isCreateModalOpen ? createForm.longitude : editingOutlet?.longitude} onChange={(e) => isCreateModalOpen ? setCreateForm({...createForm, longitude: e.target.value}) : setEditingOutlet({...editingOutlet, longitude: e.target.value})} />
                <input type="number" className="col-span-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Radius (km)" value={isCreateModalOpen ? createForm.deliveryRadiusKm : editingOutlet?.deliveryRadiusKm} onChange={(e) => isCreateModalOpen ? setCreateForm({...createForm, deliveryRadiusKm: e.target.value}) : setEditingOutlet({...editingOutlet, deliveryRadiusKm: e.target.value})} />
              </div>
              <button className="mt-8 w-full rounded-xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg" onClick={isCreateModalOpen ? handleCreateSubmit : handleEditSave} disabled={isSaving}>
                {isSaving ? "Processing..." : (isCreateModalOpen ? "Create Outlet" : "Save Changes")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mb-6 flex justify-center">{deleteConfirm.status === "ACTIVE" ? <AlertCircle size={48} className="text-rose-500"/> : <CheckCircle2 size={48} className="text-emerald-500"/>}</div>
            <h3 className="text-xl font-bold">{deleteConfirm.status === "ACTIVE" ? "Deactivate?" : "Activate?"}</h3>
            <div className="mt-8 flex gap-3">
              <button className="flex-1 rounded-xl bg-slate-100 py-3" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={`flex-1 rounded-xl py-3 text-white ${deleteConfirm.status === "ACTIVE" ? "bg-rose-500" : "bg-emerald-500"}`} onClick={() => { toggleOutletStatus(deleteConfirm); setDeleteConfirm(null); }}>Confirm</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </>
);