"use client";

import React, { useEffect, useState } from "react";
import { X, MapPin, Plus, Loader2, Home, Briefcase, Map } from "lucide-react";
import { AddressService, Address } from "@/features/addresses/address.service";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: Address) => void;
}

export default function AddressSelectionModal({ isOpen, onClose, onSelect }: AddressModalProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"LIST" | "ADD">("LIST");

  // Form State
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    type: "HOME" as const,
    addressText: "",
    latitude: 12.9716, // Default to Bangalore (or get from Geolocation API)
    longitude: 77.5946,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) fetchAddresses();
  }, [isOpen]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await AddressService.getAll();
      setAddresses(data);
      // If no addresses, automatically show add form
      if (data.length === 0) setView("ADD");
    } catch (error) {
      console.error("Failed to load addresses", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await AddressService.create(newAddress);
      setAddresses([...addresses, created]);
      setView("LIST"); // Go back to list
      // Optional: Auto-select newly created address
      // onSelect(created);
    } catch (error) {
      alert("Failed to save address");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-lg text-slate-800">
            {view === "LIST" ? "Select Delivery Address" : "Add New Address"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-emerald-600" /></div>
          ) : view === "LIST" ? (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => onSelect(addr)}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition flex items-start gap-3 group"
                >
                  <div className="mt-1 text-slate-400 group-hover:text-emerald-600">
                    {addr.type === "HOME" ? <Home size={20} /> : addr.type === "WORK" ? <Briefcase size={20} /> : <MapPin size={20} />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{addr.label}</div>
                    <div className="text-sm text-slate-500 line-clamp-2">{addr.addressText}</div>
                  </div>
                </button>
              ))}
              
              <button 
                onClick={() => setView("ADD")}
                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-semibold flex items-center justify-center gap-2 hover:border-emerald-500 hover:text-emerald-600 transition"
              >
                <Plus size={20} /> Add New Address
              </button>
            </div>
          ) : (
            /* ADD FORM */
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Label</label>
                <div className="flex gap-2">
                  {["HOME", "WORK", "OTHER"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewAddress({ ...newAddress, type: t as any, label: t === "OTHER" ? "" : t.charAt(0) + t.slice(1).toLowerCase() })}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border transition ${newAddress.type === t ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Custom Label</label>
                <input 
                  type="text" 
                  value={newAddress.label}
                  onChange={e => setNewAddress({...newAddress, label: e.target.value})}
                  className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. My Apartment"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                <textarea 
                  value={newAddress.addressText}
                  onChange={e => setNewAddress({...newAddress, addressText: e.target.value})}
                  className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                  placeholder="House No, Street, Landmark..."
                  required
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : "Save & Continue"}
                </button>
                <button 
                  type="button"
                  onClick={() => setView("LIST")}
                  className="w-full mt-2 text-slate-500 text-sm font-semibold hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}