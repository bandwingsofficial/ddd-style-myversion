"use client";

import React, { useState } from "react";
import { Mail, Calendar, ShieldCheck, Edit3 } from "lucide-react";
import EditProfileModal from "./edit/page"; 

interface PersonalDetailsViewProps {
  profile: any;
  onProfileUpdate: () => void;
}

const BACKEND_URL = 'https://admin.dev.local:4000';

export default function PersonalDetailsView({ profile, onProfileUpdate }: PersonalDetailsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BACKEND_URL}/${cleanPath}`;
  };

  const avatarFullUrl = profile?.avatarUrl ? getImageUrl(profile.avatarUrl) : null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6 mx-auto w-full max-w-4xl px-4">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Personal Details</h2>
            <p className="text-slate-500 text-sm mt-1">Manage your profile identity</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl transition-all font-bold text-sm border border-emerald-100/50"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-6 p-4 bg-slate-50/50 rounded-[2rem] border border-slate-100">
              <div className="w-24 h-24 bg-white rounded-2xl shadow-sm overflow-hidden flex items-center justify-center border border-slate-100 relative bg-emerald-50/30">
                <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-emerald-600">
                  {profile?.fullName?.charAt(0) || "?"}
                </span>

                {/* REMOVED crossOrigin attribute to simplify the request */}
                {avatarFullUrl && (
                  <img 
                    src={avatarFullUrl} 
                    alt="Profile" 
                    className="relative w-full h-full object-cover z-10"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      console.error("PersonalDetailsView: Image load failed", avatarFullUrl);
                    }}
                  />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-2xl font-bold text-slate-800">{profile?.fullName || "Not Available"}</p>
                  <ShieldCheck size={20} className="text-emerald-500" fill="currentColor" fillOpacity={0.1} />
                </div>
                <p className="text-sm text-slate-500 font-medium bg-white/50 w-fit px-3 py-1 rounded-full border border-slate-100 uppercase text-[10px] tracking-widest">
                  {profile?.gender || 'Customer'}
                </p>
              </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 px-10 bg-slate-50/30 border border-slate-100 rounded-[2rem] hover:border-emerald-100 transition-colors">
              <div className="flex items-center gap-3 text-emerald-600 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                  <Mail size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</span>
              </div>
              <p className="font-bold text-slate-700 text-lg ml-1">{profile?.email || "No email set"}</p>
            </div>

            <div className="p-4 px-10 bg-slate-50/30 border border-slate-100 rounded-[2rem] hover:border-emerald-100 transition-colors">
              <div className="flex items-center gap-3 text-emerald-600 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                  <Calendar size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Date of Birth</span>
              </div>
              <p className="font-bold text-slate-700 text-lg ml-1">
                {profile?.dob ? new Date(profile.dob).toLocaleDateString() : "Not set"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={profile}
        onSuccess={onProfileUpdate} 
      />
    </div>
  );
}