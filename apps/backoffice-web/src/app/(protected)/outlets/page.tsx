"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Edit3, Trash2, RefreshCw, 
  MapPin, Camera, Store, X, CheckCircle2, AlertCircle,
  MoreHorizontal
} from "lucide-react";
import { useOutletStore } from "@/features/outlets/outlet.store";
import { OutletService } from "@/features/outlets/outlet.service";

export default function OutletsPage() {
  const {
    outlets,
    loading,
    error,
    fetchOutlets,
    updateWorkingStatus,
    toggleCamera,
    toggleOutletStatus,
  } = useOutletStore();

  // --- MODAL & UI STATES ---
  const [search, setSearch] = useState("");
  const [editingOutlet, setEditingOutlet] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [cameraWarning, setCameraWarning] = useState<string | null>(null);

  // --- FORM STATE ---
  const [createForm, setCreateForm] = useState({
    name: "",
    branch: "",
    latitude: "",
    longitude: "",
    deliveryRadiusKm: "",
    cameraEnabled: false,
    isCentral: false,
  });

  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  // Auto-hide camera warning after 4 seconds
  useEffect(() => {
    if (cameraWarning) {
      const timer = setTimeout(() => setCameraWarning(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [cameraWarning]);

  // --- SEARCH LOGIC ---
  const filteredOutlets = useMemo(() => {
    return outlets.filter(o => 
      o.name.toLowerCase().includes(search.toLowerCase()) || 
      (o.branch && o.branch.toLowerCase().includes(search.toLowerCase()))
    );
  }, [outlets, search]);

  // --- CAMERA RESTRICTION LOGIC ---
  const handleCameraToggle = (o: any) => {
    const isDeactivated = o.status !== "ACTIVE";
    const isNotOpen = o.workingState.status !== "OPEN";

    if (isDeactivated) {
      setCameraWarning("Cannot enable camera: Outlet is INACTIVE. Activate it first.");
      return;
    }

    if (isNotOpen) {
      setCameraWarning(`Cannot enable camera: Shop is ${o.workingState.status.replace('_', ' ')}. Camera requires OPEN status.`);
      return;
    }

    toggleCamera(o);
  };

  // --- ACTIONS ---
  const handleEditSave = async () => {
    if (!editingOutlet) return;
    setFormError(null);
    const payload = {
      name: editingOutlet.name.trim(),
      branch: editingOutlet.branch?.trim() || undefined,
      latitude: Number(editingOutlet.latitude),
      longitude: Number(editingOutlet.longitude),
      deliveryRadiusKm: Number(editingOutlet.deliveryRadiusKm),
    };
    if (!payload.name || isNaN(payload.latitude) || isNaN(payload.longitude)) {
      setFormError("Please fill all required fields with valid numbers.");
      return;
    }
    setIsSaving(true);
    try {
      await OutletService.update(editingOutlet.id, payload);
      setEditingOutlet(null);
      fetchOutlets();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to update outlet.");
    } finally { setIsSaving(false); }
  };

  const handleCreateSubmit = async () => {
    setFormError(null);
    if (!createForm.name.trim() || !createForm.latitude || !createForm.longitude) {
      setFormError("Please fill all required fields.");
      return;
    }
    setIsSaving(true);
    try {
      await OutletService.create({
        ...createForm,
        latitude: Number(createForm.latitude),
        longitude: Number(createForm.longitude),
        deliveryRadiusKm: Number(createForm.deliveryRadiusKm),
      });
      setIsCreateModalOpen(false);
      setCreateForm({ name: "", branch: "", latitude: "", longitude: "", deliveryRadiusKm: "", cameraEnabled: false, isCentral: false });
      fetchOutlets();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to create outlet.");
    } finally { setIsSaving(false); }
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <RefreshCw size={40} className="text-emerald-500" />
      </motion.div>
      <p className="mt-4 text-sm font-semibold text-slate-500">Syncing Dashboard...</p>
    </div>
  );

  if (error) return <div className="p-10 text-red-500 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      
      {/* --- FLOATING NOTIFICATION --- */}
      <AnimatePresence>
        {cameraWarning && (
          <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2">
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white shadow-xl shadow-slate-900/20 ring-1 ring-white/10"
            >
              <AlertCircle size={18} className="text-amber-400" />
              <span>{cameraWarning}</span>
              <button onClick={() => setCameraWarning(null)} className="ml-2 rounded-full p-1 hover:bg-white/20">
                <X size={14}/>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* --- HEADER --- */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Outlets Management</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">Super Admin Control Panel</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex w-64 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
            <Search size={18} className="text-slate-400" />
            <input 
              placeholder="Search outlets..." 
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Create Button */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:shadow-emerald-300 hover:from-emerald-500 hover:to-emerald-700"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} strokeWidth={2.5} /> <span className="hidden sm:inline">Create Outlet</span>
          </motion.button>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Outlet Details</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Operation</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Live Camera</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredOutlets.map((o) => {
                  const isDeactivated = o.status !== "ACTIVE";
                  const isNotOpen = o.workingState.status !== "OPEN";
                  const cameraTooltip = isDeactivated ? "Shop is inactive" : isNotOpen ? "Camera only available when OPEN" : "Toggle Camera";

                  return (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={o.id} 
                      className={`
                        transition-colors hover:bg-slate-50/50 
                        ${isDeactivated ? "bg-slate-50/80 grayscale opacity-75" : "bg-white"}
                      `}
                    >
                      {/* Name Group */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                             <Store size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{o.name}</div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                              <MapPin size={10} /> {o.branch ?? "Main"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <div className={`
                          inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide border
                          ${!isDeactivated 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-slate-100 text-slate-500 border-slate-200"
                          }
                        `}>
                          <div className={`h-1.5 w-1.5 rounded-full ${!isDeactivated ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {o.status}
                        </div>
                      </td>

                      {/* Operation Select */}
                      <td className="px-6 py-4">
                        <div className="relative">
                          <select 
                            disabled={isDeactivated} 
                            value={o.workingState.status} 
                            onChange={(e) => updateWorkingStatus(o.id, e.target.value as any)}
                            className="w-full min-w-[140px] appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 focus:border-emerald-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                          >
                            <option value="OPEN">🟢 OPEN</option>
                            <option value="CLOSED">🔴 CLOSED</option>
                            <option value="TEMPORARILY_CLOSED">🟡 TEMP CLOSED</option>
                          </select>
                          {/* Custom Arrow */}
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <MoreHorizontal size={14} />
                          </div>
                        </div>
                      </td>

                      {/* Camera Toggle */}
                      <td className="px-6 py-4">
                        <div 
                          onClick={() => handleCameraToggle(o)} 
                          className={`
                            relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2
                            ${o.cameraState.status === "ON" && !isDeactivated && !isNotOpen ? 'bg-emerald-500' : 'bg-slate-200'}
                            ${(isDeactivated || isNotOpen) ? 'cursor-not-allowed opacity-60' : ''}
                          `}
                          title={cameraTooltip}
                        >
                          <span className="sr-only">Use setting</span>
                          <span
                            aria-hidden="true"
                            className={`
                              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                              ${o.cameraState.status === "ON" && !isDeactivated && !isNotOpen ? 'translate-x-5' : 'translate-x-0'}
                            `}
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                             onClick={() => setEditingOutlet({ ...o, latitude: o.location?.latitude || "", longitude: o.location?.longitude || "", deliveryRadiusKm: o.deliveryRadiusKm || "" })}
                             className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          
                          {isDeactivated ? (
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setDeleteConfirm(o)}
                              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm shadow-emerald-200 hover:bg-emerald-600"
                            >
                              ACTIVATE
                            </motion.button>
                          ) : (
                            <button 
                              onClick={() => setDeleteConfirm(o)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* --- CREATE / EDIT MODAL WRAPPER --- */}
      <AnimatePresence>
        {(isCreateModalOpen || editingOutlet) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => { setIsCreateModalOpen(false); setEditingOutlet(null); setFormError(null); }} />
            
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
                    {isCreateModalOpen ? "Create New Outlet" : "Edit Outlet"}
                  </h2>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    {isCreateModalOpen ? "Register a new branch location." : `ID: ${editingOutlet?.id.slice(-6).toUpperCase()}`}
                  </p>
                </div>
                <button 
                  onClick={() => { setIsCreateModalOpen(false); setEditingOutlet(null); }}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={20}/>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8">
                 {formError && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl bg-rose-50 p-4 text-xs font-medium text-rose-600">
                       <AlertCircle size={16} className="shrink-0 mt-0.5" />
                       <p>{formError}</p>
                    </div>
                 )}

                 <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Outlet Name</label>
                       <input 
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                          placeholder="e.g. Bengaluru" 
                          value={isCreateModalOpen ? createForm.name : editingOutlet?.name} 
                          onChange={(e) => isCreateModalOpen ? setCreateForm({...createForm, name: e.target.value}) : setEditingOutlet({...editingOutlet, name: e.target.value})} 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Branch Code</label>
                       <input 
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                          placeholder="e.g. B1" 
                          value={isCreateModalOpen ? createForm.branch : editingOutlet?.branch} 
                          onChange={(e) => isCreateModalOpen ? setCreateForm({...createForm, branch: e.target.value}) : setEditingOutlet({...editingOutlet, branch: e.target.value})} 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Latitude</label>
                       <input 
                          type="number"
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                          value={isCreateModalOpen ? createForm.latitude : editingOutlet?.latitude} 
                          onChange={(e) => isCreateModalOpen ? setCreateForm({...createForm, latitude: e.target.value}) : setEditingOutlet({...editingOutlet, latitude: e.target.value})} 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Longitude</label>
                       <input 
                          type="number"
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                          value={isCreateModalOpen ? createForm.longitude : editingOutlet?.longitude} 
                          onChange={(e) => isCreateModalOpen ? setCreateForm({...createForm, longitude: e.target.value}) : setEditingOutlet({...editingOutlet, longitude: e.target.value})} 
                       />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Delivery Radius (km)</label>
                       <input 
                          type="number"
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" 
                          value={isCreateModalOpen ? createForm.deliveryRadiusKm : editingOutlet?.deliveryRadiusKm} 
                          onChange={(e) => isCreateModalOpen ? setCreateForm({...createForm, deliveryRadiusKm: e.target.value}) : setEditingOutlet({...editingOutlet, deliveryRadiusKm: e.target.value})} 
                       />
                    </div>
                 </div>

                 {isCreateModalOpen && (
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
                    onClick={isCreateModalOpen ? handleCreateSubmit : handleEditSave}
                    disabled={isSaving}
                 >
                    {isSaving ? (isCreateModalOpen ? "Creating..." : "Saving...") : (isCreateModalOpen ? "Create Outlet" : "Save Changes")}
                 </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- STATUS CONFIRMATION MODAL --- */}
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
                  onClick={() => { toggleOutletStatus(deleteConfirm); setDeleteConfirm(null); }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}