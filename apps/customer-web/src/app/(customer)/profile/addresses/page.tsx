"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Home, Briefcase, MapPin, Trash2, ArrowLeft, 
  Pencil, AlertCircle, CheckCircle, Loader2, Crosshair, X 
} from "lucide-react";
import { AddressService, Address } from "@/features/addresses/address.service";
import { useLiveLocation } from "@/features/location/hooks/useLiveLocation";
import { forwardGeocode, reverseGeocode } from "@/features/location/utils/reverseGeocode";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";

interface PopupState {
  type: "error" | "success" | "confirm";
  message: string;
  onConfirm?: () => void;
}

export default function AddressListPage() {
  const router = useRouter();
  const { lat, lng } = useLiveLocation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<PopupState | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const [formData, setFormData] = useState({
    label: "Home",
    type: "HOME" as "HOME" | "WORK" | "OTHER",
    latitude: 0,
    longitude: 0,
  });

  const [details, setDetails] = useState({
    houseNo: "", area: "", landmark: "", pincode: ""
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await AddressService.getAll();
      setAddresses(data.filter(a => !a.isDeleted));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (addr?: Address) => {
    if (addr) {
      setEditingId(addr.id);
      setFormData({
        label: addr.label,
        type: addr.type,
        latitude: addr.latitude,
        longitude: addr.longitude
      });
      const pinMatch = addr.addressText.match(/\b\d{6}\b/);
      const pincode = pinMatch ? pinMatch[0] : "";
      let areaPart = addr.addressText.replace(pincode, "").replace(/-\s*$/, "").trim();
      let houseNo = "";
      const firstCommaIndex = areaPart.indexOf(",");
      if (firstCommaIndex > -1 && firstCommaIndex < 20) {
        houseNo = areaPart.substring(0, firstCommaIndex).trim();
        areaPart = areaPart.substring(firstCommaIndex + 1).trim();
      }
      setDetails({ houseNo, area: areaPart, landmark: "", pincode });
    } else {
      setEditingId(null);
      const hasHome = addresses.some(a => a.type === "HOME");
      const hasWork = addresses.some(a => a.type === "WORK");
      const defaultType = !hasHome ? "HOME" : !hasWork ? "WORK" : "OTHER";
      setFormData({
        label: defaultType === "OTHER" ? "" : defaultType.charAt(0) + defaultType.slice(1).toLowerCase(),
        type: defaultType,
        latitude: 0,
        longitude: 0
      });
      setDetails({ houseNo: "", area: "", landmark: "", pincode: "" });
    }
    setShowFormModal(true);
  };

  const handleUseCurrent = async () => {
    if (!lat || !lng) return setPopup({ type: "error", message: "Location unavailable. Please allow permissions." });
    setDetecting(true);
    try {
      const addr = await reverseGeocode(lat, lng);
      if (addr) {
        const pin = addr.match(/\d{6}/)?.[0] || "";
        const area = addr.replace(pin, "").replace(/,\s*$/, "").trim();
        setDetails(prev => ({ ...prev, area: area, pincode: pin }));
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
      }
    } finally {
      setDetecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations with Popup instead of static text
    const isTaken = addresses.some(a => a.type === formData.type && a.id !== editingId);
    if (formData.type !== "OTHER" && isTaken) {
      return setPopup({ type: "error", message: `You already have a ${formData.type} address saved.` });
    }
    if (!details.area || !details.pincode) {
      return setPopup({ type: "error", message: "Street/Locality and Pincode are required." });
    }

    setSubmitting(true);
    let finalLat = formData.latitude;
    let finalLng = formData.longitude;

    if (finalLat === 0) {
      const coords = await forwardGeocode(`${details.area} ${details.pincode}`);
      if (coords) { finalLat = coords.lat; finalLng = coords.lng; }
    }

    try {
      const addressText = `${details.houseNo ? details.houseNo + ', ' : ''}${details.landmark ? details.landmark + ', ' : ''}${details.area} - ${details.pincode}`;
      const payload = { ...formData, latitude: finalLat, longitude: finalLng, addressText };

      if (editingId) {
        await AddressService.update(editingId, payload);
      } else {
        await AddressService.create(payload);
      }
      
      setShowFormModal(false);
      loadAddresses();
      setPopup({ type: "success", message: "Address saved successfully!" });
    } catch (err: any) {
      // Catch backend 400 errors and display in popup
      const msg = err.response?.data?.message || "Could not save address. Check if this type already exists.";
      setPopup({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setPopup({
      type: "confirm",
      message: "This address will be removed from your saved list.",
      onConfirm: async () => {
        try {
          setPopup(null);
          await AddressService.delete(id);
          setAddresses((prev) => prev.filter((a) => a.id !== id));
        } catch (error) {
          setPopup({ type: "error", message: "Failed to delete address" });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* ✅ Global Popup Overlay (Centered on Screen) */}
      {popup && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-slate-100 transform scale-100 animate-in zoom-in-95 duration-200">
            <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${popup.type === 'confirm' ? 'bg-orange-50 text-orange-500' : popup.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
              {popup.type === 'success' ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
            </div>
            <h3 className="font-extrabold text-slate-900 mb-2 text-lg">
              {popup.type === 'confirm' ? 'Delete Address?' : popup.type === 'error' ? 'Oops!' : 'Success!'}
            </h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">{popup.message}</p>
            <div className="flex gap-3">
              {popup.type === 'confirm' ? (
                <>
                  <button onClick={() => setPopup(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition text-sm">Cancel</button>
                  <button onClick={popup.onConfirm} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-100 text-sm">Delete</button>
                </>
              ) : (
                <button onClick={() => setPopup(null)} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition text-sm">Dismiss</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-[9998] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2rem] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-10 duration-500 ease-out">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight animate-shine">{editingId ? "Edit Address" : "Add New Address"}</h2>
                <p className="text-xs text-slate-400 font-medium">Please provide accurate delivery details</p>
              </div>
              <button onClick={() => setShowFormModal(false)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto scrollbar-hide">
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Address Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {["HOME", "WORK", "OTHER"].map((t) => {
                    const isTaken = addresses.some(a => a.type === t && a.id !== editingId);
                    const disabled = t !== "OTHER" && isTaken;
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={disabled}
                        onClick={() => setFormData({ ...formData, type: t as any, label: t === "OTHER" ? "" : t.charAt(0) + t.slice(1).toLowerCase() })}
                        className={`py-1.5 rounded-2xl font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                          formData.type === t ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100 scale-[0.98]' : 
                          disabled ? 'bg-slate-30 text-slate-300 border-slate-50 cursor-not-allowed' : 'bg-white text-slate-500 border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30'
                        }`}
                      >
                        <span className="text-sm">{t}</span>
                        {disabled && <span className="text-[8px] font-medium opacity-60">Already set</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                   <input 
                    type="text" 
                    value={formData.label} 
                    onChange={e => setFormData({...formData, label: e.target.value})}
                    placeholder="E.g. My Penthouse"
                    className="w-full pl-4 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm placeholder:font-medium"
                    readOnly={formData.type !== "OTHER"}
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">LABEL</div>
                </div>

                <button 
                  type="button"
                  onClick={handleUseCurrent}
                  disabled={detecting}
                  className="w-full py-3 flex items-center justify-center gap-3 bg-white text-slate-700 font-bold rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all disabled:opacity-50 text-sm"
                >
                  {detecting ? <Loader2 className="animate-spin" size={18} /> : <Crosshair size={18} className="text-emerald-500" />} 
                  Locate me automatically
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">FLAT / HOUSE NO.</label>
                    <input value={details.houseNo} onChange={e => setDetails({...details, houseNo: e.target.value})} placeholder="102, B-Block" className="w-full p-3 rounded-2xl border border-slate-100 focus:outline-none focus:border-emerald-500 bg-slate-50/30 text-sm font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">PINCODE *</label>
                    <input value={details.pincode} onChange={e => setDetails({...details, pincode: e.target.value})} placeholder="6-digit PIN" className="w-full p-3 rounded-2xl border border-slate-100 focus:outline-none focus:border-emerald-500 bg-slate-50/30 text-sm font-semibold" required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 ml-1">STREET / LOCALITY *</label>
                  <textarea value={details.area} onChange={e => setDetails({...details, area: e.target.value})} placeholder="Full building name or street..." className="w-full p-3 rounded-2xl border border-slate-100 h-24 resize-none focus:outline-none focus:border-emerald-500 bg-slate-50/30 text-sm font-semibold" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 ml-1">LANDMARK (OPTIONAL)</label>
                  <input value={details.landmark} onChange={e => setDetails({...details, landmark: e.target.value})} placeholder="Near Central Park..." className="w-full p-3 rounded-2xl border border-slate-100 focus:outline-none focus:border-emerald-500 bg-slate-50/30 text-sm font-semibold" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 disabled:opacity-70 text-base active:scale-[0.98]"
              >
                {submitting ? "Processing..." : editingId ? "Update Address" : "Save & Continue"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ✅ List View */}
      <main className="max-w-4xl mx-auto px-4 pt-10 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition text-slate-600">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight animate-shine">Saved Addresses</h1>
              <p className="text-sm text-slate-400 font-medium">Manage your delivery locations</p>
            </div>
          </div>

          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 text-sm active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add New</span>
          </button>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <p className="text-slate-400 font-bold text-sm">Fetching addresses...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-slate-300" size={30} />
              </div>
              <h3 className="text-slate-900 font-extrabold">No addresses yet</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-[200px] mx-auto">Add a delivery address to get started with your orders.</p>
            </div>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="group bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-start gap-4 transition-all hover:shadow-xl hover:shadow-slate-200/50 hover:border-emerald-100 relative overflow-hidden">
                <div className={`p-4 rounded-2xl transition-colors shrink-0 ${
                  addr.type === 'HOME' ? 'bg-blue-50 text-blue-500' : addr.type === 'WORK' ? 'bg-orange-50 text-orange-500' : 'bg-purple-50 text-purple-500'
                }`}>
                  {addr.type === "HOME" ? <Home size={22}/> : addr.type === "WORK" ? <Briefcase size={22}/> : <MapPin size={22}/>}
                </div>
                
                <div className="flex-1 min-w-0 pr-12">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-slate-700 text-lg leading-tight truncate">{addr.label}</h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg uppercase tracking-wider">{addr.type}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-sm font-medium line-clamp-2">{addr.addressText}</p>
                </div>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openModal(addr)}
                    className="w-9 h-9 flex items-center justify-center bg-white text-slate-400 hover:text-emerald-600 rounded-xl shadow-sm border border-slate-100 transition-all hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(addr.id)} 
                    className="w-9 h-9 flex items-center justify-center bg-white text-slate-400 hover:text-red-600 rounded-xl shadow-sm border border-slate-100 transition-all hover:border-red-200 hover:bg-red-50"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}