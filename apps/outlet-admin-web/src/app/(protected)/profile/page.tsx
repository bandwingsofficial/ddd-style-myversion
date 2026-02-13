'use client';

import { useEffect, useState } from 'react';
import { Edit2, Phone, Mail, FileText, ShieldCheck, AlertCircle, Calendar, Smartphone } from 'lucide-react';
import OutletProfileForm from '@/features/outlet/components/OutletProfileForm';
import OutletProfileDangerZone from '@/features/outlet/components/OutletProfileDangerZone';
import { useOutletProfile } from '@/features/outlet/hooks/useOutletProfile';
import { outletService } from '@/features/outlet/services/outletService';
import { Outlet } from '@/features/outlet/types';

type Mode = 'create' | 'view' | 'edit';

// Define your backend URL constant
const BACKEND_URL = 'https://api.dev.local:4000';

export default function OutletProfilePage() {
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [loadingOutlet, setLoadingOutlet] = useState(true);
  const [mode, setMode] = useState<Mode>('view');

  // 1. Fetch the main Outlet first
  useEffect(() => {
    const fetchOutlet = async () => {
      try {
        const data = await outletService.getOutlet();
        setOutlet(data);
      } catch (error) {
        console.error("Failed to fetch main outlet:", error);
        setOutlet(null);
      } finally {
        setLoadingOutlet(false);
      }
    };
    fetchOutlet();
  }, []);

  // 2. Pass the outlet ID to the profile hook. 
  const outletId = outlet?.id ?? '';
  const { profile, loading: loadingProfile, refresh } = useOutletProfile(outletId);

  // 3. Determine the display mode based on whether a profile exists
  useEffect(() => {
    if (!loadingOutlet && !loadingProfile) {
      if (!profile) setMode('create');
      else setMode('view');
    }
  }, [profile, loadingOutlet, loadingProfile]);

  // Loading State UI
  if (loadingOutlet || (outlet && loadingProfile)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm animate-pulse">Loading outlet profile...</p>
      </div>
    );
  }

  // Error State: No Outlet Found
  if (!outlet) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 text-center bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-red-900">Outlet Not Found</h2>
        <p className="text-red-600 text-sm mt-1">Please ensure your account is correctly linked to an outlet.</p>
      </div>
    );
  }

  /**
   * Helper to format image URLs correctly
   */
  const getImageUrl = (path: string) => {
    if (!path) return '';
    // If it's already a full URL (blob or external), return as is
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    // Prepend the backend URL to the path from the database
    return `${BACKEND_URL}/${path}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10">
      {/* Banner Section */}
      {mode === 'view' && profile && (
        <div className="h-48 w-full bg-slate-200 relative">
          {profile.bannerUrl ? (
            <img 
              src={getImageUrl(profile.bannerUrl)} 
              alt="Banner" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-600 opacity-20" />
          )}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4">
        {/* VIEW MODE */}
        {mode === 'view' && profile && (
          <div className="relative -mt-12 space-y-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-6 pb-6 border-b border-slate-100">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg border border-slate-100">
                    <div className="w-full h-full rounded-xl bg-slate-400 flex items-center justify-center text-white text-3xl font-semibold overflow-hidden">
                      {profile.avatarUrl ? (
                        <img 
                          src={getImageUrl(profile.avatarUrl)} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        profile.ownerName?.charAt(0) || 'S'
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-slate-800">{profile.ownerName}</h2>
                  <div className="flex justify-center sm:justify-start gap-2 mt-2">
                    <span className="px-2.5 py-0.5 bg-cyan-400 text-white text-[10px] font-bold rounded-md">
                      Active
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 sm:mt-0">
                  <OutletProfileDangerZone 
                    outletId={outletId} 
                    onDeleted={refresh} 
                  />
                  <button 
                    onClick={() => setMode('edit')}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-100"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                <ProfileItem icon={<Mail size={16}/>} label="Email" value={profile.contactEmail} />
                <ProfileItem icon={<Phone size={16}/>} label="Phone" value={profile.contactPhone} />
                <ProfileItem icon={<Smartphone size={16}/>} label="Outlet" value={outlet.name} />
                <ProfileItem icon={<FileText size={16}/>} label="GST" value={profile.gstNumber} />
                <ProfileItem icon={<ShieldCheck size={16}/>} label="FSSAI" value={profile.fssaiNumber} />
                <ProfileItem icon={<Calendar size={16}/>} label="Created" value={new Date(profile.createdAt).toLocaleDateString()} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Outlet</h3>
                <p className="text-slate-600 text-sm leading-relaxed italic">
                    "{profile.description || 'No description provided.'}"
                </p>
            </div>
          </div>
        )}

        {/* CREATE / EDIT MODE */}
        {(mode === 'create' || mode === 'edit') && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-md p-6">
            <OutletProfileForm
              outletId={outletId}
              profile={mode === 'edit' ? profile : null}
              isEdit={mode === 'edit'}
              onCancel={() => setMode('view')}
              onSuccess={() => {
                refresh();
                setMode('view');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors shrink-0">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
        <span className="text-slate-700 font-medium text-sm truncate">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}