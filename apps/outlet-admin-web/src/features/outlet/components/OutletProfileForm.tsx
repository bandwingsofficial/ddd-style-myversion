'use client';

import { useState, useRef } from 'react';
import { Save, X, Image as ImageIcon, Briefcase, Phone, Mail, Hash, FileText, Camera, Upload } from 'lucide-react';
import {
  OutletProfile,
  CreateOutletProfilePayload,
} from '../types/outletProfile.types';
import { outletProfileService } from '../services/outletProfile.service';

interface Props {
  outletId: string;
  profile: OutletProfile | null;
  isEdit: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OutletProfileForm({
  outletId,
  profile,
  isEdit,
  onSuccess,
  onCancel,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New states for files
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  // Preview URLs
  const [logoPreview, setLogoPreview] = useState<string>(profile?.logoUrl ?? '');
  const [bannerPreview, setBannerPreview] = useState<string>(profile?.bannerUrl ?? '');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CreateOutletProfilePayload>({
    logoUrl: profile?.logoUrl ?? '',
    bannerUrl: profile?.bannerUrl ?? '',
    contactPhone: profile?.contactPhone ?? '',
    contactEmail: profile?.contactEmail ?? '',
    ownerName: profile?.ownerName ?? '',
    description: profile?.description ?? '',
    gstNumber: profile?.gstNumber ?? '',
    fssaiNumber: profile?.fssaiNumber ?? '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setLogoFile(file);
          setLogoPreview(reader.result as string);
        } else {
          setBannerFile(file);
          setBannerPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Note: In a real app, you'd send FormData if uploading actual files to your API
      // For now, this maintains your service structure
      if (isEdit) {
        await outletProfileService.update(outletId, form);
      } else {
        await outletProfileService.create(outletId, form);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          {isEdit ? 'Update Profile Information' : 'Complete Profile Setup'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Provide accurate details to ensure your business information is displayed correctly.
        </p>
      </div>

      {/* Image Upload Section */}
      <div className="mb-8 space-y-4">
        <div className="md:col-span-2 flex items-center gap-2 mb-3">
          <div className="p-1 bg-emerald-50 rounded text-emerald-600">
            <Camera size={14} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Media & Branding</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Outlet Logo</label>
            <div 
              onClick={() => logoInputRef.current?.click()}
              className="relative h-32 w-32 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group"
            >
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="text-white" size={20} />
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="mx-auto text-slate-300 mb-1" size={24} />
                  <span className="text-[10px] text-slate-400 font-medium">Upload Logo</span>
                </div>
              )}
              <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
            </div>
          </div>

          {/* Banner Upload */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Banner Image</label>
            <div 
              onClick={() => bannerInputRef.current?.click()}
              className="relative h-32 w-full rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group"
            >
              {bannerPreview ? (
                <>
                  <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Upload className="text-white" size={20} />
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="mx-auto text-slate-300 mb-1" size={24} />
                  <span className="text-[10px] text-slate-400 font-medium">Upload Banner Image</span>
                </div>
              )}
              <input type="file" ref={bannerInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Contact Section */}
        <div className="md:col-span-2 flex items-center gap-2 mt-4 mb-1 border-t border-slate-50 pt-4">
          <div className="p-1 bg-emerald-50 rounded text-emerald-600">
             <Phone size={14} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Contact Channels</span>
        </div>
        {renderInput('Contact Phone', 'contactPhone', '+91...', <Phone size={14}/>)}
        {renderInput('Contact Email', 'contactEmail', 'owner@example.com', <Mail size={14}/>)}

        {/* Business Section */}
        <div className="md:col-span-2 flex items-center gap-2 mt-4 mb-1 border-t border-slate-50 pt-4">
          <div className="p-1 bg-emerald-50 rounded text-emerald-600">
             <Briefcase size={14} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Legal Credentials</span>
        </div>
        {renderInput('Owner Name', 'ownerName', 'Full Name', <Briefcase size={14}/>)}
        {renderInput('GST Number', 'gstNumber', 'GSTIN', <FileText size={14}/>)}
        {renderInput('FSSAI Number', 'fssaiNumber', '14-digit license', <Hash size={14}/>)}
      </div>

      {/* Description Area */}
      <div className="mt-6">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
          Business Biography
        </label>
        <textarea
          placeholder="Briefly describe your outlet's history or specialties..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-50 focus:border-emerald-500 transition-all outline-none text-sm text-slate-800 placeholder:text-slate-300 bg-slate-50/20"
        />
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
        {isEdit && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors flex items-center gap-2 border border-transparent"
          >
            <X size={16} />
            Cancel
          </button>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-lg text-sm font-bold text-white shadow-md shadow-emerald-100 transition-all flex items-center gap-2 ${
            isSubmitting 
              ? 'bg-emerald-400 cursor-not-allowed' 
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97]'
          }`}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {isEdit ? 'Save Changes' : 'Create Profile'}
        </button>
      </div>
    </form>
  );

  function renderInput(
    labelText: string, 
    key: keyof CreateOutletProfilePayload, 
    placeholder: string,
    icon: React.ReactNode
  ) {
    return (
      <div className="space-y-1.5 min-w-0">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-2 ml-1">
          {labelText}
        </label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            {icon}
          </div>
          <input
            placeholder={placeholder}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-50 focus:border-emerald-500 transition-all outline-none text-sm text-slate-800 placeholder:text-slate-300 bg-slate-50/30 focus:bg-white"
          />
        </div>
      </div>
    );
  }
}