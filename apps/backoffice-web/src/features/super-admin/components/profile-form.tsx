"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save, AlertCircle, Pencil, User, Phone, Briefcase, FileText, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { profileSchema, ProfileFormValues, ProfileData } from "../types";
import { SuperAdminApi } from "../api/use-profile";

/**
 * HELPER: Construct the full image URL.
 * Updated to port 4000 based on your browser console logs.
 */
const getImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  // If it's already a full URL or a local blob (during upload preview), return as is
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  
  // MATCH THIS TO YOUR BACKEND LOGS: https://api.dev.local:4000
  const API_URL = "https://api.dev.local:4000"; 
  
  // Ensure we don't double up on slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${cleanPath}`;
};

export const ProfileForm = () => {
  const [initialData, setInitialData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", title: "", phone: "", notes: "" },
  });

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await SuperAdminApi.getProfile();
      if (data) {
        setInitialData(data);
        form.reset({
          fullName: data.fullName,
          title: data.title,
          phone: data.phone,
          notes: data.notes || "",
          avatarUrl: data.avatarUrl || ""
        });
        // Construct the full URL for display from the saved database path
        setPreviewUrl(getImageUrl(data.avatarUrl));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("avatar", file); 
      // Temporary local URL for instant preview before saving
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const onUpdateSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      formData.append("fullName", values.fullName);
      formData.append("title", values.title);
      formData.append("phone", values.phone);
      formData.append("notes", values.notes || "");
      
      // Append file with key 'avatar' to match your Postman/Backend setup
      if (values.avatar) {
        formData.append("avatar", values.avatar);
      }

      const response = await SuperAdminApi.saveProfile(formData, !!initialData);

      toast.success(initialData ? "Profile updated successfully" : "Profile created successfully");
      
      setInitialData(response);
      setPreviewUrl(getImageUrl(response.avatarUrl));
      setIsEditModalOpen(false);
      
      window.dispatchEvent(new Event("profile-updated"));
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to save profile";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* DISPLAY VIEW */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-emerald-600 h-32 w-full" />
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-lg overflow-hidden">
              <div className="h-full w-full rounded-xl bg-gray-100 flex items-center justify-center">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Profile Avatar" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                        // Handle cases where the backend path is broken or port is wrong
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}
              </div>
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-700 font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100"
            >
              <Pencil size={16} /> Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InfoItem icon={<User size={18}/>} label="Full Name" value={initialData?.fullName || "Not set"} />
            <InfoItem icon={<Briefcase size={18}/>} label="Professional Title" value={initialData?.title || "Not set"} />
            <InfoItem icon={<Phone size={18}/>} label="Phone Number" value={initialData?.phone || "Not set"} />
            <InfoItem icon={<FileText size={18}/>} label="Notes" value={initialData?.notes || "No notes available"} isFullWidth />
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2rem] w-full max-w-2xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-gray-900">Edit Profile</h3>
                <button onClick={() => setIsEditModalOpen(false)}><AlertCircle className="rotate-45 text-gray-400" /></button>
              </div>

              <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-6">
                {/* AVATAR UPLOAD SECTION */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="h-28 w-28 rounded-3xl bg-gray-100 border-4 border-emerald-50 flex items-center justify-center overflow-hidden">
                      {previewUrl ? <img src={previewUrl} className="h-full w-full object-cover" /> : <User size={40} className="text-gray-300" />}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Camera size={18} /></div>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Full Name" name="fullName" register={form.register} error={form.formState.errors.fullName?.message} />
                  <FormInput label="Professional Title" name="title" register={form.register} error={form.formState.errors.title?.message} />
                  <FormInput label="Phone Number" name="phone" register={form.register} error={form.formState.errors.phone?.message} />
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-700">Notes</label>
                    <textarea {...form.register("notes")} className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-emerald-500 transition-all" rows={3} />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 p-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
                  <button disabled={isSubmitting} className="flex-1 p-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition-all">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoItem = ({ icon, label, value, isFullWidth }: any) => (
  <div className={`space-y-1 ${isFullWidth ? "md:col-span-2" : ""}`}>
    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider">{icon} {label}</div>
    <p className="text-gray-900 font-semibold pl-7 truncate">{value}</p>
  </div>
);

const FormInput = ({ label, name, register, error }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-gray-700">{label}</label>
    <input {...register(name)} className={`w-full p-4 rounded-xl bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} outline-none focus:border-emerald-500 transition-all`} />
    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
);