"use client";

import React, { useState, useEffect } from "react";
import { X, Save, User, Mail, Calendar, ChevronDown } from "lucide-react";
import { profileApi } from "@/features/customer-profile/api/profile.api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: any;
  onSuccess: () => void;
}

export default function EditProfileModal({ isOpen, onClose, initialData, onSuccess }: EditProfileModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "MALE",
    dob: "",
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        gender: initialData.gender || "MALE",
        dob: initialData.dob ? initialData.dob.split("T")[0] : "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await profileApi.upsertProfile(formData);
      if (response.success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    /* FIX: Added top-0, left-0, w-screen, h-screen to ensure the backdrop 
       covers everything and isn't pushed down by the header.
    */
    <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* FIX: Added a wrapper with overflow-hidden to keep the rounded corners 
         clean and a max-height to ensure it doesn't overflow the screen.
      */}
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Modal Header - Fixed at top */}
        <div className="shrink-0 flex items-center justify-between p-5 border-b border-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight animate-shine">Edit Profile</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Personal Identity</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-red-500"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body - Scrollable if content is too long */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
          
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-[0.15em]">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none text-slate-800 font-bold transition-all"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-[0.15em]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none text-slate-800 font-bold transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-[0.15em]">Gender</label>
              <div className="relative">
                <select 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none text-slate-800 font-bold appearance-none transition-all"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-[0.15em]">Birth Date</label>
              <input 
                type="date"
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none text-slate-800 font-bold transition-all"
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
              />
            </div>
          </div>
        </form>

        {/* Modal Footer - Fixed at bottom */}
        <div className="p-7 border-t border-slate-50 bg-slate-50/50 shrink-0">
          <button 
            disabled={saving}
            type="submit" 
            onClick={handleSubmit}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}