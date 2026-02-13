"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Save, User, Mail, Calendar, ChevronDown, Camera } from "lucide-react";
import { profileApi } from "@/features/customer-profile/api/profile.api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: any;
  onSuccess: () => void;
}

export default function EditProfileModal({ isOpen, onClose, initialData, onSuccess }: EditProfileModalProps) {
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "MALE",
    dob: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: initialData?.fullName || "",
        email: initialData?.email || "",
        gender: initialData?.gender || "MALE",
        dob: initialData?.dob ? initialData.dob.split("T")[0] : "",
      });
      
      if (initialData?.avatarUrl) {
        setPreviewUrl(`${process.env.NEXT_PUBLIC_API_URL || 'https://admin.dev.local:4000'}/${initialData.avatarUrl}`);
      } else {
        setPreviewUrl(null);
      }
      setSelectedFile(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      alert("Full Name is required");
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append("fullName", formData.fullName.trim());
      data.append("gender", formData.gender);
      
      if (formData.email) data.append("email", formData.email);
      if (formData.dob) data.append("dob", formData.dob);
      
      if (selectedFile) {
        data.append("avatar", selectedFile);
      }

      let response;
      if (initialData && Object.keys(initialData).length > 0) {
        response = await profileApi.updateProfile(data);
      } else {
        response = await profileApi.createProfile(data);
      }

      if (response.success) {
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error("Operation failed:", error.response?.data || error.message);
      const serverMessage = error.response?.data?.message || "Failed to save profile.";
      alert(serverMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      {/* Reduced rounded corners to 2xl */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Tightened Header Padding */}
        <div className="shrink-0 flex items-center justify-between p-4 border-b border-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
               {initialData ? "Edit Profile" : "Create Profile"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tightened Body Padding and Gaps */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              {/* Profile image container reduced radius */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-50 bg-slate-100 shadow-sm">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <User size={32} />
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 text-white rounded-lg shadow-lg hover:bg-emerald-700 transition-all"
              >
                <Camera size={14} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-800 font-bold text-sm focus:border-emerald-500 transition-all"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="email"
                disabled={!!initialData}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-800 font-bold text-sm disabled:opacity-60 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-800 font-bold text-sm appearance-none focus:border-emerald-500 transition-all"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Birth Date</label>
              <input 
                type="date"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl outline-none text-slate-800 font-bold text-sm focus:border-emerald-500 transition-all"
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
              />
            </div>
          </div>
        </form>

        {/* Tightened Footer Padding */}
        <div className="p-5 border-t border-slate-50 bg-slate-50/50 shrink-0">
          <button 
            disabled={saving}
            type="submit" 
            onClick={handleSubmit}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-base shadow-lg hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {saving ? "Saving..." : initialData ? "Save Changes" : "Create Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}