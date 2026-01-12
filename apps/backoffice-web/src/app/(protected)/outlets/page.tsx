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
    <div style={styles.loaderContainer}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <RefreshCw size={40} color="#10b981" />
      </motion.div>
      <p style={{ marginTop: 12, color: "#64748b", fontWeight: 500 }}>Syncing Dashboard...</p>
    </div>
  );

  if (error) return <div style={{ padding: 40, color: "#ef4444" }}>{error}</div>;

  return (
    <div style={styles.container}>
      
      {/* --- FLOATING NOTIFICATION --- */}
      <AnimatePresence>
        {cameraWarning && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            style={styles.toast}
          >
            <AlertCircle size={20} />
            <span>{cameraWarning}</span>
            <button onClick={() => setCameraWarning(null)} style={styles.toastClose}><X size={16}/></button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* --- HEADER --- */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Outlets Management</h1>
          <p style={styles.subtitle}>Super Admin Control Panel</p>
        </div>
        
        <div style={styles.headerActions}>
          <div style={styles.searchBox}>
            <Search size={18} color="#94a3b8" />
            <input 
              placeholder="Search outlets..." 
              style={styles.searchInput} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={styles.greenPopButton} 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={20} /> Create New Outlet
          </motion.button>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>OUTLET DETAILS</th>
              <th style={styles.th}>STATUS</th>
              <th style={styles.th}>OPERATION</th>
              <th style={styles.th}>LIVE CAMERA</th>
              <th style={styles.th}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
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
                    style={{ 
                      ...styles.tr, 
                      filter: isDeactivated ? "grayscale(0.6) opacity(0.8)" : "none", 
                      backgroundColor: isDeactivated ? "#F8FAFC" : "white" 
                    }}
                  >
                    <td style={styles.td}>
                      <div style={styles.nameGroup}>
                        <div style={styles.iconCircle}><Store size={16} color="#10b981"/></div>
                        <div>
                          <div style={styles.nameText}>{o.name}</div>
                          <div style={styles.branchText}><MapPin size={12}/> {o.branch ?? "Main"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, backgroundColor: !isDeactivated ? "#DCFCE7" : "#F1F5F9", color: !isDeactivated ? "#166534" : "#64748B" }}>
                        <div style={{...styles.dot, backgroundColor: !isDeactivated ? "#22C55E" : "#94A3B8"}} />
                        {o.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <select 
                        disabled={isDeactivated} 
                        value={o.workingState.status} 
                        style={styles.select} 
                        onChange={(e) => updateWorkingStatus(o.id, e.target.value as any)}
                      >
                        <option value="OPEN">🟢 OPEN</option>
                        <option value="CLOSED">🔴 CLOSED</option>
                        <option value="TEMPORARILY_CLOSED">🟡 TEMP CLOSED</option>
                      </select>
                    </td>
                    <td style={styles.td}>
                      <div 
                        onClick={() => handleCameraToggle(o)} 
                        style={{ cursor: 'pointer', display: 'inline-block' }}
                      >
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          title={cameraTooltip}
                           
                          style={{ 
                            ...styles.toggleSwitch, 
                            backgroundColor: o.cameraState.status === "ON" && !isDeactivated && !isNotOpen ? "#10b981" : "#D1D5DB",
                            opacity: (isDeactivated || isNotOpen) ? 0.6 : 1
                          }}
                        >
                          <motion.div 
                            animate={{ x: o.cameraState.status === "ON" && !isDeactivated && !isNotOpen ? 20 : 2 }} 
                            style={styles.toggleThumb} 
                          />
                        </motion.button>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button style={styles.iconBtn} onClick={() => setEditingOutlet({ ...o, latitude: o.location?.latitude || "", longitude: o.location?.longitude || "", deliveryRadiusKm: o.deliveryRadiusKm || "" })}>
                          <Edit3 size={18} color="#3B82F6" />
                        </button>
                        
                        {isDeactivated ? (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={styles.activateBtnHighlight} 
                            onClick={() => setDeleteConfirm(o)}
                          >
                            ACTIVATE
                          </motion.button>
                        ) : (
                          <button style={styles.iconBtn} onClick={() => setDeleteConfirm(o)}>
                            <Trash2 size={18} color="#EF4444" />
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
      </motion.div>

      {/* --- CREATE MODAL --- */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div style={styles.modalOverlay} onClick={() => { setIsCreateModalOpen(false); setFormError(null); }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={styles.editModal} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.drawerHeader}>
                <div>
                  <h2 style={styles.drawerTitle}>Create New Outlet</h2>
                  <p style={styles.subtitle}>Register a new branch location.</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} style={styles.closeBtn}><X size={20}/></button>
              </div>
              
              {formError && <div style={styles.errorBanner}>{formError}</div>}

              <div style={styles.grid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Outlet Name *</label>
                  <input style={styles.input} placeholder="e.g. Bengaluru" value={createForm.name} onChange={(e) => setCreateForm({...createForm, name: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Branch Code</label>
                  <input style={styles.input} placeholder="e.g. B1" value={createForm.branch} onChange={(e) => setCreateForm({...createForm, branch: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Latitude *</label>
                  <input style={styles.input} type="number" value={createForm.latitude} onChange={(e) => setCreateForm({...createForm, latitude: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Longitude *</label>
                  <input style={styles.input} type="number" value={createForm.longitude} onChange={(e) => setCreateForm({...createForm, longitude: e.target.value})} />
                </div>
                <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
                  <label style={styles.label}>Delivery Radius (km)</label>
                  <input style={styles.input} type="number" value={createForm.deliveryRadiusKm} onChange={(e) => setCreateForm({...createForm, deliveryRadiusKm: e.target.value})} />
                </div>
              </div>

              <div style={{marginTop: '20px'}}>
                 <label style={styles.checkboxContainer}>
                    <input type="checkbox" checked={createForm.cameraEnabled} onChange={e => setCreateForm({...createForm, cameraEnabled: e.target.checked})} />
                    <span style={styles.checkboxTitle}>Enable Live Camera</span>
                 </label>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                style={styles.greenPopButtonLarge} 
                onClick={handleCreateSubmit} 
                disabled={isSaving}
              >
                {isSaving ? "Creating..." : "Create Outlet"}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT MODAL (ORIGINAL LOGIC) --- */}
      <AnimatePresence>
        {editingOutlet && (
          <div style={styles.modalOverlay} onClick={() => { setEditingOutlet(null); setFormError(null); }}>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              style={styles.editModal} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.drawerHeader}>
                <div>
                  <h2 style={styles.drawerTitle}>Edit Outlet</h2>
                  <span style={styles.idBadge}>ID: {editingOutlet.id.slice(-6).toUpperCase()}</span>
                </div>
                <button onClick={() => setEditingOutlet(null)} style={styles.closeBtn}><X size={20}/></button>
              </div>

              {formError && <div style={styles.errorBanner}>{formError}</div>}

              <div style={styles.grid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Outlet Name</label>
                  <input style={styles.input} value={editingOutlet.name} onChange={(e) => setEditingOutlet({...editingOutlet, name: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Branch</label>
                  <input style={styles.input} value={editingOutlet.branch} onChange={(e) => setEditingOutlet({...editingOutlet, branch: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Latitude</label>
                  <input style={styles.input} type="number" value={editingOutlet.latitude} onChange={(e) => setEditingOutlet({...editingOutlet, latitude: e.target.value})} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Longitude</label>
                  <input style={styles.input} type="number" value={editingOutlet.longitude} onChange={(e) => setEditingOutlet({...editingOutlet, longitude: e.target.value})} />
                </div>
                <div style={{...styles.inputGroup, gridColumn: 'span 2'}}>
                  <label style={styles.label}>Delivery Radius (km)</label>
                  <input style={styles.input} type="number" value={editingOutlet.deliveryRadiusKm} onChange={(e) => setEditingOutlet({...editingOutlet, deliveryRadiusKm: e.target.value})} />
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                style={styles.greenPopButtonLarge} 
                onClick={handleEditSave} 
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- STATUS CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {deleteConfirm && (
          <div style={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={styles.modal}
            >
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                {deleteConfirm.status === "ACTIVE" ? (
                  <AlertCircle size={60} color="#EF4444" strokeWidth={1.5} />
                ) : (
                  <CheckCircle2 size={60} color="#10B981" strokeWidth={1.5} />
                )}
              </div>
              <h3 style={styles.modalTitle}>
                {deleteConfirm.status === "ACTIVE" ? "Deactivate Outlet?" : "Activate Outlet?"}
              </h3>
              <p style={{ color: '#64748B', fontSize: '14px', textAlign: 'center', lineHeight: '1.5', marginBottom: '32px' }}>
                Changing <strong>{deleteConfirm.name}</strong> will update its availability immediately.
              </p>
              <div style={styles.modalActions}>
                <button style={styles.modalCancel} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button 
                  style={{...styles.modalConfirm, backgroundColor: deleteConfirm.status === "ACTIVE" ? "#EF4444" : "#10B981"}} 
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

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "10px",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    position: "relative"
  },
  toast: {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    zIndex: 9999,
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    fontSize: "14px",
    fontWeight: 500,
    border: "1px solid rgba(255,255,255,0.1)"
  },
  toastClose: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    padding: "4px",
    marginLeft: "8px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "32px"
  },
  headerActions: { display: "flex", gap: "16px", alignItems: "center" },
  title: { fontSize: "28px", fontWeight: 800, color: "#1e293b", margin: 0 },
  subtitle: { color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "0 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    width: "280px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
  },
  searchInput: {
    border: "none",
    padding: "12px",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    backgroundColor: "transparent"
  },
  greenPopButton: {
    background: "linear-gradient(180deg, #34d399 0%, #10b981 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
  },
  greenPopButtonLarge: {
    background: "linear-gradient(180deg, #34d399 0%, #10b981 100%)",
    color: "white",
    border: "none",
    padding: "16px",
    borderRadius: "14px",
    fontWeight: 700,
    fontSize: "16px",
    width: "100%",
    marginTop: "24px",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
    textTransform: "uppercase",
    letterSpacing: "1px"
  },
  activateBtnHighlight: {
    backgroundColor: "#10B981",
    color: "white",
    border: "none",
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)",
    letterSpacing: "0.5px",
    textTransform: "uppercase"
  },
  tableCard: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)"
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "16px 24px",
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.05em"
  },
  td: { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
  nameGroup: { display: "flex", alignItems: "center", gap: "12px" },
  iconCircle: { 
    width: "36px", height: "36px", borderRadius: "10px", 
    backgroundColor: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" 
  },
  nameText: { fontWeight: 700, color: "#1e293b", fontSize: "15px" },
  branchText: { color: "#94a3b8", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600
  },
  dot: { width: "8px", height: "8px", borderRadius: "50%" },
  select: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    outline: "none",
    backgroundColor: "#fff"
  },
  toggleSwitch: {
    width: "44px", height: "22px", borderRadius: "20px",
    border: "none", cursor: "pointer", position: "relative",
    padding: 0, transition: "background-color 0.3s"
  },
  toggleThumb: {
    width: "18px", height: "18px", backgroundColor: "#fff",
    borderRadius: "50%", position: "absolute", top: "2px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
  },
  iconBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: "8px", borderRadius: "8px", transition: "background 0.2s"
  },
  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
  },
  editModal: {
    backgroundColor: "#fff", width: "500px", borderRadius: "24px",
    padding: "32px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
  },
  drawerHeader: { display: "flex", justifyContent: "space-between", marginBottom: "24px" },
  drawerTitle: { fontSize: "22px", fontWeight: 700, color: "#1e293b", margin: 0 },
  closeBtn: { background: "none", border: "none", cursor: "pointer", color: "#64748b" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#475569" },
  input: {
    padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px"
  },
  checkboxContainer: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  checkboxTitle: { fontSize: "14px", fontWeight: 500, color: "#475569" },
  idBadge: { fontSize: "11px", backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", color: "#64748b" },
  errorBanner: { padding: "12px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" },
  modal: { backgroundColor: "#fff", width: "400px", borderRadius: "20px", padding: "32px" },
  modalTitle: { textAlign: "center", fontSize: "20px", fontWeight: 700, marginBottom: "8px" },
  modalActions: { display: "flex", gap: "12px" },
  modalCancel: { flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "#fff", cursor: "pointer" },
  modalConfirm: { flex: 1, padding: "12px", borderRadius: "10px", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer" },
  loaderContainer: { height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }
};