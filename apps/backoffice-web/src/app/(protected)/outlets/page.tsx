"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw, LayoutDashboard, CheckCircle2, XCircle, Clock, TrendingUp, Store } from "lucide-react";
import { useOutletStore } from "@/features/outlets/outlet.store";
import { OutletService } from "@/features/outlets/outlet.service";

import { OutletHeader } from "@/features/outlets/components/OutletHeader";
import { OutletTable } from "@/features/outlets/components/OutletTable";
import { OutletFormModal } from "@/features/outlets/components/OutletFormModal";
import { OutletConfirmModal } from "@/features/outlets/components/OutletConfirmModal";

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

  const [search, setSearch] = useState("");
  const [editingOutlet, setEditingOutlet] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [cameraWarning, setCameraWarning] = useState<string | null>(null);

  // UPDATED: Added address and pincode to initial state
  const [createForm, setCreateForm] = useState({
    name: "", 
    branch: "", 
    address: "", 
    pincode: "", 
    latitude: "", 
    longitude: "", 
    deliveryRadiusKm: "", 
    cameraEnabled: false, 
    isCentral: false,
  });

  useEffect(() => { fetchOutlets(); }, [fetchOutlets]);

  useEffect(() => {
    if (cameraWarning) {
      const timer = setTimeout(() => setCameraWarning(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [cameraWarning]);

  const filteredOutlets = useMemo(() => {
    return outlets.filter(o => 
      o.name.toLowerCase().includes(search.toLowerCase()) || 
      (o.branch && o.branch.toLowerCase().includes(search.toLowerCase())) ||
      (o.address && o.address.toLowerCase().includes(search.toLowerCase()))
    );
  }, [outlets, search]);

  const stats = useMemo(() => ({
    total: outlets.length,
    active: outlets.filter(o => o.status === "ACTIVE").length,
    closed: outlets.filter(o => o.workingState?.status === "CLOSED").length,
    temp: outlets.filter(o => o.workingState?.status === "TEMPORARILY_CLOSED").length,
  }), [outlets]);

  const handleCameraToggle = (o: any) => {
    if (o.status !== "ACTIVE") { setCameraWarning("Cannot enable camera: Outlet is INACTIVE."); return; }
    if (o.workingState.status !== "OPEN") { setCameraWarning(`Camera requires OPEN status.`); return; }
    toggleCamera(o);
  };

  const handleEditSave = async () => {
    if (!editingOutlet) return;
    setFormError(null);
    
    // UPDATED: Added address and pincode to update payload
    const payload = {
      name: editingOutlet.name.trim(),
      branch: editingOutlet.branch?.trim() || undefined,
      address: editingOutlet.address?.trim(),
      pincode: editingOutlet.pincode?.trim(),
      latitude: Number(editingOutlet.latitude),
      longitude: Number(editingOutlet.longitude),
      deliveryRadiusKm: Number(editingOutlet.deliveryRadiusKm),
    };

    setIsSaving(true);
    try {
      await OutletService.update(editingOutlet.id, payload);
      setEditingOutlet(null);
      fetchOutlets();
    } catch (err: any) { 
        setFormError(err.response?.data?.message?.[0] || "Failed to update outlet."); 
    } finally { setIsSaving(false); }
  };

  const handleCreateSubmit = async () => {
    setFormError(null);
    setIsSaving(true);
    try {
      // UPDATED: Ensuring address and pincode are in the spread
      const payload: any = { 
        ...createForm, 
        latitude: Number(createForm.latitude), 
        longitude: Number(createForm.longitude), 
        deliveryRadiusKm: Number(createForm.deliveryRadiusKm) 
      };

      if (createForm.cameraEnabled) payload.workingState = { status: "OPEN" };
      
      await OutletService.create(payload);
      setIsCreateModalOpen(false);
      
      // RESET FORM: Including new fields
      setCreateForm({ 
        name: "", 
        branch: "", 
        address: "", 
        pincode: "", 
        latitude: "", 
        longitude: "", 
        deliveryRadiusKm: "", 
        cameraEnabled: false, 
        isCentral: false 
      });
      
      fetchOutlets();
    } catch (err: any) { 
        // Better error logging to see why backend rejected (400)
        const errorMsg = err.response?.data?.message;
        setFormError(Array.isArray(errorMsg) ? errorMsg[0] : "Failed to create outlet. Check all fields."); 
    } finally { setIsSaving(false); }
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <RefreshCw size={48} className="text-emerald-500" />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-2 md:p-2 font-sans">
      <AnimatePresence>
        {cameraWarning && (
          <div className="fixed top-10 left-1/2 z-[100] -translate-x-1/2">
            <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className="flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-2xl">
              <AlertCircle size={20} className="text-amber-400" /> {cameraWarning}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Outlets", val: stats.total, icon: Store, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Outlets", val: stats.active, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Closed Now", val: stats.closed, icon: XCircle, color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Temp Closed", val: stats.temp, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
             <div className="flex items-center gap-4">
                <div className={`rounded-xl ${s.bg} ${s.color} p-2.5`}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-500">{s.label}</p>
                  <h3 className="text-2xl font-black text-slate-800 leading-tight">{s.val}</h3>
                </div>
             </div>
             <div className="text-emerald-400 opacity-60">
                <TrendingUp size={24} />
             </div>
          </div>
        ))}
      </div>

      <OutletHeader search={search} setSearch={setSearch} onCreateClick={() => setIsCreateModalOpen(true)} />

      <OutletTable 
        outlets={filteredOutlets}
        updateWorkingStatus={updateWorkingStatus}
        handleCameraToggle={handleCameraToggle}
        setEditingOutlet={setEditingOutlet}
        setDeleteConfirm={setDeleteConfirm}
      />

      <OutletFormModal 
        isOpen={isCreateModalOpen || !!editingOutlet}
        onClose={() => { setIsCreateModalOpen(false); setEditingOutlet(null); setFormError(null); }}
        isCreateMode={isCreateModalOpen}
        editingOutlet={editingOutlet}
        createForm={createForm}
        setCreateForm={setCreateForm}
        setEditingOutlet={setEditingOutlet}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleEditSave}
        isSaving={isSaving}
        error={formError}
      />

      <OutletConfirmModal 
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        onConfirm={(o) => { toggleOutletStatus(o); setDeleteConfirm(null); }}
      />
    </div>
  );
}