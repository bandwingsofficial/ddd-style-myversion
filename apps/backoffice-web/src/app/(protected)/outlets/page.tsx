"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { useOutletStore } from "@/features/outlets/outlet.store";
import { OutletService } from "@/features/outlets/outlet.service";

// --- FIXED IMPORTS BELOW (Pointing to features folder) ---
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
      // Prepare the payload
      const payload: any = {
        ...createForm,
        latitude: Number(createForm.latitude),
        longitude: Number(createForm.longitude),
        deliveryRadiusKm: Number(createForm.deliveryRadiusKm),
      };

      // FIX: If camera is enabled, enforce shop OPEN status automatically
      if (createForm.cameraEnabled) {
        payload.workingState = { status: "OPEN" };
      }

      await OutletService.create(payload);
      
      setIsCreateModalOpen(false);
      setCreateForm({ name: "", branch: "", latitude: "", longitude: "", deliveryRadiusKm: "", cameraEnabled: false, isCentral: false });
      fetchOutlets();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || "Failed to create outlet.");
    } finally { setIsSaving(false); }
  };

  const handleConfirmStatusChange = (outlet: any) => {
    toggleOutletStatus(outlet);
    setDeleteConfirm(null);
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
      
      {/* --- HEADER COMPONENT --- */}
      <OutletHeader 
        search={search}
        setSearch={setSearch}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* --- TABLE COMPONENT --- */}
      <OutletTable 
        outlets={filteredOutlets}
        updateWorkingStatus={updateWorkingStatus}
        handleCameraToggle={handleCameraToggle}
        setEditingOutlet={setEditingOutlet}
        setDeleteConfirm={setDeleteConfirm}
      />

      {/* --- FORM MODAL (CREATE / EDIT) --- */}
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

      {/* --- STATUS CONFIRMATION MODAL --- */}
      <OutletConfirmModal 
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}