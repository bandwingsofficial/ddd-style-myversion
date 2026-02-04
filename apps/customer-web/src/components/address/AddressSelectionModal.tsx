"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, MapPin, Plus, Loader2, Home, Briefcase, Pencil, Trash2, AlertCircle, CheckCircle, Crosshair, Map as MapIcon, Check } from "lucide-react";
import { AddressService, Address } from "@/features/addresses/address.service";
import { useLiveLocation } from "@/features/location/hooks/useLiveLocation";
import { reverseGeocode, forwardGeocode } from "@/features/location/utils/reverseGeocode"; 
import { useOutletStore } from "@/features/outlet/outlet.store";
import { useCartStore } from "@/features/cart/cart.store";
import { getPublicOutlets } from "@/features/outlet/api/outlet.api"; 
import { useLocationStore } from "@/features/location/location.store"; 
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store"; // ✅ Import Auth Store

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: Address) => void;
}

interface PopupState {
  type: "error" | "success" | "confirm";
  message: string;
  onConfirm?: () => void;
}

interface DetailedAddress {
  houseNo: string;
  area: string; 
  landmark: string;
  pincode: string;
}

const INITIAL_FORM_STATE = {
  label: "Home",
  type: "HOME" as "HOME" | "WORK" | "OTHER",
  addressText: "",
  latitude: 0,
  longitude: 0,
};

// --- Helper: Calculate Distance ---
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const MAX_RADIUS_KM = 6; 

export default function AddressSelectionModal({ isOpen, onClose, onSelect }: AddressModalProps) {
  const router = useRouter();
  
  // Stores
  const { selectedOutlet, setOutlet } = useOutletStore();
  const { items: cartItems, clear } = useCartStore(); // ✅ Get clear function
  const { setLocation } = useLocationStore(); 
  const { isAuthenticated } = useCustomerAuthStore(); // ✅ Get Auth status

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOutlet, setCheckingOutlet] = useState(false);
  
  const [view, setView] = useState<"LIST" | "FORM">("LIST");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [details, setDetails] = useState<DetailedAddress>({
    houseNo: "", area: "", landmark: "", pincode: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);

  const { lat, lng } = useLiveLocation();
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [geocodingStatus, setGeocodingStatus] = useState<"IDLE" | "SEARCHING" | "FOUND" | "NOT_FOUND">("IDLE");

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
      setView("LIST");
      setEditingId(null);
      setPopup(null);
      setCheckingOutlet(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (view === "FORM" && details.area.length > 5 && !detectingLoc) {
      const timer = setTimeout(async () => {
        setGeocodingStatus("SEARCHING");
        const coords = await forwardGeocode(details.area);
        
        if (coords) {
          setFormData(prev => ({ ...prev, latitude: coords.lat, longitude: coords.lng }));
          setGeocodingStatus("FOUND");
        } else {
          setGeocodingStatus("NOT_FOUND");
        }
      }, 1500); 
      return () => clearTimeout(timer);
    } else {
        setGeocodingStatus("IDLE");
    }
  }, [details.area, view, detectingLoc]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await AddressService.getAll();
      const activeAddresses = data.filter((a) => !a.isDeleted);
      setAddresses(activeAddresses);
      if (activeAddresses.length === 0) startAddMode(activeAddresses);
    } catch (error) {
      console.error("Failed to load addresses", error);
    } finally {
      setLoading(false);
    }
  };

  const getTakenTypes = (currentList: Address[], ignoreId?: string | null) => {
    const others = ignoreId ? currentList.filter((a) => a.id !== ignoreId) : currentList;
    return {
      hasHome: others.some((a) => a.type === "HOME"),
      hasWork: others.some((a) => a.type === "WORK"),
    };
  };

  const startAddMode = (currentList = addresses) => {
    const { hasHome, hasWork } = getTakenTypes(currentList, null);
    let defaultType: "HOME" | "WORK" | "OTHER" = "HOME";
    let defaultLabel = "Home";
    if (hasHome) { defaultType = "WORK"; defaultLabel = "Work"; }
    if (hasHome && hasWork) { defaultType = "OTHER"; defaultLabel = ""; }

    setEditingId(null);
    setFormData({ ...INITIAL_FORM_STATE, type: defaultType, label: defaultLabel });
    setDetails({ houseNo: "", area: "", landmark: "", pincode: "" });
    setView("FORM");
  };

  const startEditMode = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      type: address.type,
      addressText: address.addressText,
      latitude: address.latitude,
      longitude: address.longitude,
    });
    
    const parts = address.addressText.split("-");
    const lastPart = parts[parts.length - 1]?.trim();
    const isPincode = /^\d{6}$/.test(lastPart);
    
    setDetails({
        houseNo: "", 
        area: isPincode ? parts.slice(0, -1).join("-").trim() : address.addressText,
        landmark: "", 
        pincode: isPincode ? lastPart : ""
    });

    setGeocodingStatus("IDLE");
    setView("FORM");
  };

  const handleUseCurrentLocation = async () => {
    if (!lat || !lng) {
      setPopup({ type: "error", message: "Location not available. Please allow browser permissions." });
      return;
    }

    setDetectingLoc(true);
    setGeocodingStatus("FOUND");
    try {
      const addressString = await reverseGeocode(lat, lng);
      
      if (addressString) {
        let extractedPincode = "";
        const pincodeMatch = addressString.match(/\b\d{6}\b/);
        if (pincodeMatch) extractedPincode = pincodeMatch[0];

        const cleanArea = addressString
            .replace(extractedPincode, "")
            .replace(/,\s*$/, "")
            .replace(/,\s*India$/, "")
            .trim();

        setDetails(prev => ({
            ...prev,
            area: cleanArea,
            pincode: extractedPincode
        }));
      }

      setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    } catch (err) {
      setPopup({ type: "error", message: "Could not fetch address details." });
    } finally {
      setDetectingLoc(false);
    }
  };

  // ✅ UPDATED: Clear Cart on Mismatch
  const handleSelectAddress = async (address: Address) => {
    setCheckingOutlet(true);
    try {
        const allOutlets = await getPublicOutlets();

        if (!allOutlets || allOutlets.length === 0) {
            setPopup({ type: "error", message: "No outlets found in the system." });
            setCheckingOutlet(false);
            return;
        }

        const validOutlets = allOutlets.map(outlet => {
             if (!outlet.location?.latitude || !outlet.location?.longitude) return { ...outlet, distance: Infinity };
             const dist = calculateDistance(
                 address.latitude, address.longitude, 
                 outlet.location.latitude, outlet.location.longitude
             );
             return { ...outlet, distance: dist };
        }).filter(o => o.distance <= MAX_RADIUS_KM).sort((a, b) => a.distance - b.distance);

        const nearestOutlet = validOutlets.length > 0 ? validOutlets[0] : null;

        if (!nearestOutlet) {
             setPopup({ type: "error", message: "Sorry, no outlet found near this address." });
             setCheckingOutlet(false);
             return;
        }

        const cartOutletId = cartItems.length > 0 ? cartItems[0].outletId : null;

        // ✅ If there's an outlet mismatch (either with Cart items OR current selection)
        if ((cartOutletId && nearestOutlet.id !== cartOutletId) || (selectedOutlet && nearestOutlet.id !== selectedOutlet.id)) {
             
             setCheckingOutlet(false);
             setPopup({ 
                 type: "error", // Visual Style
                 message: `This location is served by a different branch (${nearestOutlet.name}). Your cart will be cleared to load the fresh menu.`,
                 onConfirm: async () => {
                     // 1. Clear Cart (Fixes the 400 Error)
                     await clear(isAuthenticated);

                     // 2. Update Context
                     setOutlet(nearestOutlet);
                     setLocation(address.latitude, address.longitude, address.label || address.addressText);
                     
                     // 3. Redirect to Home
                     router.push("/home"); 
                 }
             });
             return; 
        }

        // ✅ Match or Empty Cart
        setOutlet(nearestOutlet);
        setLocation(address.latitude, address.longitude, address.label || address.addressText);
        onSelect(address); 
        onClose(); 

    } catch (error) {
        console.error("Error checking outlet:", error);
        setPopup({ type: "error", message: "Failed to verify delivery location." });
    } finally {
        if (!selectedOutlet) setCheckingOutlet(false); 
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPopup({
      type: "confirm",
      message: "Are you sure you want to delete this address?",
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!details.houseNo.trim()) { setPopup({ type: "error", message: "Please enter House / Flat Number." }); return; }
    if (!details.area.trim()) { setPopup({ type: "error", message: "Please enter Street / Area details." }); return; }
    if (!details.pincode.trim() || details.pincode.length < 6) { setPopup({ type: "error", message: "Please enter a valid Pincode." }); return; }

    const finalAddress = `${details.houseNo.trim()}, ${details.landmark ? details.landmark.trim() + ", " : ""}${details.area.trim()} - ${details.pincode.trim()}`;

    const payload = { ...formData, addressText: finalAddress };

    if (payload.latitude === 0 || payload.longitude === 0) {
       const coords = await forwardGeocode(details.area);
       if (!coords) {
         setPopup({ type: "error", message: "We couldn't locate this address. Please use 'Current Location' or check the details." });
         return;
       }
       payload.latitude = coords.lat;
       payload.longitude = coords.lng;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await AddressService.update(editingId, payload);
        setAddresses((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
      } else {
        const created = await AddressService.create(payload);
        setAddresses((prev) => [...prev, created]);
      }
      setView("LIST");
    } catch (error) {
      console.error(error);
      setPopup({ type: "error", message: "Failed to save address. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const { hasHome, hasWork } = getTakenTypes(addresses, editingId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      
      {/* POPUP OVERLAY */}
      {popup && (
        <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-xs w-full text-center border border-slate-100 transform transition-all scale-100">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${popup.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
              {popup.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
            </div>
            <h3 className="font-bold text-slate-800 mb-2">{popup.type === 'confirm' ? 'Confirm' : popup.type === 'error' ? 'Location Change' : 'Success'}</h3>
            <p className="text-slate-500 text-sm mb-6">{popup.message}</p>
            <div className="flex gap-3 justify-center">
              {popup.type === 'confirm' ? (
                <>
                  <button onClick={() => setPopup(null)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">Cancel</button>
                  <button onClick={popup.onConfirm} className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30">Delete</button>
                </>
              ) : (
                <button 
                    onClick={() => { 
                        if (popup.onConfirm) popup.onConfirm();
                        setPopup(null);
                    }} 
                    className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
                >
                    Okay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN MODAL */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up relative">
        
        {/* Loading Overlay */}
        {checkingOutlet && (
             <div className="absolute inset-0 z-50 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm">
                <Loader2 className="animate-spin text-emerald-600 w-10 h-10 mb-2" />
                <p className="text-sm font-semibold text-emerald-700">Checking delivery availability...</p>
             </div>
        )}

        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-lg text-slate-800">
            {view === "LIST" ? "Select Delivery Address" : (editingId ? "Edit Address" : "Add New Address")}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500 hover:text-slate-800"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-600 w-8 h-8" /></div>
          ) : view === "LIST" ? (
            /* --- LIST VIEW --- */
            <div className="space-y-3">
              {addresses.map((addr) => {
                const isActive = false;
                return (
                    <div key={addr.id} className="relative group">
                        <button 
                            onClick={() => handleSelectAddress(addr)} 
                            className={`w-full text-left p-4 pr-20 rounded-xl border transition-all flex items-start gap-3 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30`}
                        >
                        <div className={`mt-1 text-slate-400 group-hover:text-emerald-600`}>
                            {addr.type === "HOME" ? <Home size={20} /> : addr.type === "WORK" ? <Briefcase size={20} /> : <MapPin size={20} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="font-bold text-slate-900">{addr.label}</div>
                            </div>
                            <div className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{addr.addressText}</div>
                        </div>
                        </button>
                        <div className="absolute top-3 right-3 flex gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); startEditMode(addr); }} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition"><Pencil size={14} /></button>
                        <button onClick={(e) => handleDelete(addr.id, e)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"><Trash2 size={14} /></button>
                        </div>
                    </div>
                );
              })}
              <button onClick={() => startAddMode()} className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl text-slate-500 hover:text-emerald-600 font-semibold flex items-center justify-center gap-2 transition-all bg-slate-50/50 hover:bg-emerald-50/30"><Plus size={20} /> Add New Address</button>
            </div>
          ) : (
            /* --- FORM VIEW --- */
            <form onSubmit={handleSave} className="space-y-5">
              {/* Form inputs same as before... */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Label Type</label>
                <div className="flex gap-3">
                  {["HOME", "WORK", "OTHER"].map((t) => {
                    const isTaken = (t === "HOME" && hasHome) || (t === "WORK" && hasWork);
                    const isSelected = formData.type === t;
                    return (
                      <button key={t} type="button" disabled={isTaken} onClick={() => setFormData({ ...formData, type: t as any, label: t === "OTHER" ? "" : t.charAt(0) + t.slice(1).toLowerCase() })} className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all relative ${isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'} ${isTaken ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 hover:border-slate-200' : ''}`}>
                        {t} {isTaken && <span className="block text-[8px] font-normal leading-none mt-0.5 opacity-80">(Exists)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Label Name</label>
                <input type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className={`w-full p-3.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${formData.type !== "OTHER" ? "border-slate-100 text-slate-500" : "border-slate-200 text-slate-900"}`} placeholder="e.g. My Apartment" readOnly={formData.type !== "OTHER"} required />
              </div>

              <button type="button" onClick={handleUseCurrentLocation} disabled={detectingLoc} className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {detectingLoc ? <Loader2 className="animate-spin" size={18} /> : <Crosshair size={18} />} 
                {detectingLoc ? "Fetching Location..." : "Use Current Location"}
              </button>

              <div className="h-px bg-slate-100 my-2" />

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">House / Flat No <span className="text-red-500">*</span></label>
                        <input type="text" value={details.houseNo} onChange={e => setDetails({...details, houseNo: e.target.value})} className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="#102, 1st Floor" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Pincode <span className="text-red-500">*</span></label>
                        <input type="text" value={details.pincode} onChange={e => { const val = e.target.value.replace(/\D/g, '').slice(0, 6); setDetails({...details, pincode: val}); }} className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="5600xx" />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Street / Area / Locality <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <textarea value={details.area} onChange={e => setDetails({...details, area: e.target.value})} className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none bg-slate-50 focus:bg-white transition-all text-slate-800 leading-relaxed" placeholder="e.g. MG Road, Near Central Park..." />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Nearby Landmark (Optional)</label>
                    <input type="text" value={details.landmark} onChange={e => setDetails({...details, landmark: e.target.value})} className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="e.g. Opposite to Apollo Pharmacy" />
                 </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setView("LIST")} className="flex-1 py-3.5 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting || geocodingStatus === "SEARCHING"} className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                  {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : (editingId ? "Update Address" : "Save Address")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}