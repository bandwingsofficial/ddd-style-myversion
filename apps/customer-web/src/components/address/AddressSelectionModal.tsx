"use client";

import React, { useEffect, useState } from "react";
import { X, MapPin, Plus, Loader2, Home, Briefcase, Pencil, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { AddressService, Address } from "@/features/addresses/address.service";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: Address) => void;
}

// Internal Popup State Type
interface PopupState {
  type: "error" | "success" | "confirm";
  message: string;
  onConfirm?: () => void;
}

const INITIAL_FORM_STATE = {
  label: "Home",
  type: "HOME" as "HOME" | "WORK" | "OTHER",
  addressText: "",
  latitude: 12.9716,
  longitude: 77.5946,
};

export default function AddressSelectionModal({ isOpen, onClose, onSelect }: AddressModalProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Views: LIST or FORM
  const [view, setView] = useState<"LIST" | "FORM">("LIST");

  // Editing: null = Create Mode, string = Update Mode
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);

  // ✅ NEW: Custom Popup State (Replaces alert/confirm)
  const [popup, setPopup] = useState<PopupState | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
      setView("LIST");
      setEditingId(null);
      setPopup(null);
    }
  }, [isOpen]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await AddressService.getAll();
      const activeAddresses = data.filter((a) => !a.isDeleted);
      setAddresses(activeAddresses);

      if (activeAddresses.length === 0) {
        startAddMode(activeAddresses);
      }
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

  // --- ACTIONS ---

  const startAddMode = (currentList = addresses) => {
    const { hasHome, hasWork } = getTakenTypes(currentList, null);

    let defaultType: "HOME" | "WORK" | "OTHER" = "HOME";
    let defaultLabel = "Home";

    if (hasHome) { defaultType = "WORK"; defaultLabel = "Work"; }
    if (hasHome && hasWork) { defaultType = "OTHER"; defaultLabel = ""; }

    setEditingId(null);
    setFormData({ ...INITIAL_FORM_STATE, type: defaultType, label: defaultLabel });
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
    setView("FORM");
  };

  // ✅ REPLACED: confirm() with Custom Popup
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setPopup({
      type: "confirm",
      message: "Are you sure you want to delete this address?",
      onConfirm: async () => {
        try {
          setPopup(null); // Close popup
          await AddressService.delete(id);
          setAddresses((prev) => prev.filter((a) => a.id !== id));
        } catch (error) {
          setPopup({ type: "error", message: "Failed to delete address" });
        }
      }
    });
  };

  // ✅ REPLACED: alert() with Custom Popup
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        const updated = await AddressService.update(editingId, formData);
        setAddresses((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
      } else {
        const created = await AddressService.create(formData);
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
    // ✅ FIX: Z-Index 9999 ensures it sits above your Header
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      
      {/* --- CUSTOM POPUP OVERLAY --- */}
      {popup && (
        <div className="absolute inset-0 z-[10000] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-xs w-full text-center border border-slate-100 transform transition-all scale-100">
            <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${popup.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
              {popup.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
            </div>
            <h3 className="font-bold text-slate-800 mb-2">
              {popup.type === 'confirm' ? 'Confirm Action' : popup.type === 'error' ? 'Error' : 'Success'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">{popup.message}</p>
            
            <div className="flex gap-3 justify-center">
              {popup.type === 'confirm' ? (
                <>
                  <button 
                    onClick={() => setPopup(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={popup.onConfirm}
                    className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30"
                  >
                    Yes, Delete
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setPopup(null)}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
                >
                  Okay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN MODAL --- */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up relative">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-lg text-slate-800">
            {view === "LIST" ? "Select Delivery Address" : (editingId ? "Edit Address" : "Add New Address")}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500 hover:text-slate-800">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-600 w-8 h-8" /></div>
          ) : view === "LIST" ? (
            /* --- LIST VIEW --- */
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr.id} className="relative group">
                  {/* Selectable Area */}
                  <button
                    onClick={() => onSelect(addr)}
                    className="w-full text-left p-4 pr-20 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-start gap-3"
                  >
                    <div className="mt-1 text-slate-400 group-hover:text-emerald-600">
                      {addr.type === "HOME" ? <Home size={20} /> : addr.type === "WORK" ? <Briefcase size={20} /> : <MapPin size={20} />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{addr.label}</div>
                      <div className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{addr.addressText}</div>
                    </div>
                  </button>

                  {/* Actions (Edit/Delete) - Floating Right */}
                  <div className="absolute top-3 right-3 flex gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEditMode(addr); }}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(addr.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => startAddMode()}
                className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl text-slate-500 hover:text-emerald-600 font-semibold flex items-center justify-center gap-2 transition-all bg-slate-50/50 hover:bg-emerald-50/30"
              >
                <Plus size={20} /> Add New Address
              </button>
            </div>
          ) : (
            /* --- FORM VIEW --- */
            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Label Type</label>
                <div className="flex gap-3">
                  {["HOME", "WORK", "OTHER"].map((t) => {
                    const isTaken = (t === "HOME" && hasHome) || (t === "WORK" && hasWork);
                    const isSelected = formData.type === t;
                    
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={isTaken}
                        onClick={() => setFormData({ 
                          ...formData, 
                          type: t as any, 
                          label: t === "OTHER" ? "" : t.charAt(0) + t.slice(1).toLowerCase() 
                        })}
                        className={`
                          flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all relative
                          ${isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-[1.02]' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400'}
                          ${isTaken ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 hover:border-slate-200' : ''}
                        `}
                      >
                        {t}
                        {isTaken && <span className="block text-[8px] font-normal leading-none mt-0.5 opacity-80">(Exists)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Label Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Label Name</label>
                <input 
                  type="text" 
                  value={formData.label}
                  onChange={e => setFormData({...formData, label: e.target.value})}
                  className={`w-full p-3.5 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${formData.type !== "OTHER" ? "border-slate-100 text-slate-500" : "border-slate-200 text-slate-900"}`}
                  placeholder="e.g. My Apartment"
                  readOnly={formData.type !== "OTHER"} 
                  required
                />
              </div>

              {/* Address Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wide">Full Address</label>
                <textarea 
                  value={formData.addressText}
                  onChange={e => setFormData({...formData, addressText: e.target.value})}
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32 resize-none bg-slate-50 focus:bg-white transition-all text-slate-800 leading-relaxed"
                  placeholder="House No, Street, Landmark, City..."
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setView("LIST")}
                  className="flex-1 py-3.5 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                >
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