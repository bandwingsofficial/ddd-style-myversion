'use client';

import { useEffect, useState } from 'react';
import { Edit2, Building2, Phone, Mail, FileText, ShieldCheck, AlertCircle, Calendar, User, Smartphone } from 'lucide-react';
import OutletProfileForm from '@/features/outlet/components/OutletProfileForm';
import OutletProfileDangerZone from '@/features/outlet/components/OutletProfileDangerZone';
import { useOutletProfile } from '@/features/outlet/hooks/useOutletProfile';
import { outletService } from '@/features/outlet/services/outletService';
import { Outlet } from '@/features/outlet/types';

type Mode = 'create' | 'view' | 'edit';

export default function OutletProfilePage() {
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [loadingOutlet, setLoadingOutlet] = useState(true);
  const [mode, setMode] = useState<Mode>('view');

  useEffect(() => {
    const fetchOutlet = async () => {
      try {
        const data = await outletService.getOutlet();
        setOutlet(data);
      } catch {
        setOutlet(null);
      } finally {
        setLoadingOutlet(false);
      }
    };
    fetchOutlet();
  }, []);

  const outletId = outlet?.id ?? '';
  const { profile, loading, refresh } = useOutletProfile(outletId);

  useEffect(() => {
    if (!loading && !profile) setMode('create');
    else if (profile) setMode('view');
  }, [profile, loading]);

  if (loadingOutlet || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!outlet) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 text-center bg-red-50 rounded-xl border border-red-100">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-red-900">Outlet Not Found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-6 ml-1 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            My Profile
          </h1>
        </div>

        {/* VIEW MODE */}
        {mode === 'view' && profile && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
              
              {/* Profile Header Area */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-100">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-slate-400 flex items-center justify-center text-white text-3xl font-semibold border-2 border-white shadow-md">
                        {profile.ownerName?.charAt(0) || 'S'}
                    </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-800">{profile.ownerName}</h2>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md uppercase">
                      SUPER_ADMIN
                    </span>
                    <span className="px-2.5 py-0.5 bg-cyan-400 text-white text-[10px] font-bold rounded-md">
                      Active
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setMode('edit')}
                  className="hidden sm:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              </div>

              {/* Stats/Info Grid - 3 Columns on desktop for compactness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                <ProfileItem icon={<Mail size={16}/>} label="Email" value={profile.contactEmail} />
                <ProfileItem icon={<Phone size={16}/>} label="Phone" value={profile.contactPhone} />
                <ProfileItem icon={<Smartphone size={16}/>} label="Outlet" value={outlet.name} />
                <ProfileItem icon={<FileText size={16}/>} label="GST" value={profile.gstNumber} />
                <ProfileItem icon={<ShieldCheck size={16}/>} label="FSSAI" value={profile.fssaiNumber} />
                <ProfileItem icon={<Calendar size={16}/>} label="Updated" value={new Date().toLocaleDateString()} />
              </div>
              
              <button 
                onClick={() => setMode('edit')}
                className="sm:hidden w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Outlet</h3>
                <p className="text-slate-600 text-sm leading-relaxed italic">
                    "{profile.description || 'No description provided.'}"
                </p>
            </div>

            {/* Danger Zone */}
            <div className="mt-8">
               <OutletProfileDangerZone 
                outletId={outletId} 
                onDeleted={refresh} 
              />
            </div>
          </div>
        )}

        {/* CREATE / EDIT MODE */}
        {(mode === 'create' || mode === 'edit') && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
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

/* ---------- Sub-components ---------- */

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