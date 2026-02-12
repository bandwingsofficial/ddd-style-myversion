"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save, AlertCircle, Pencil, User, Phone, Briefcase, FileText, Camera, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { profileSchema, ProfileFormValues, ProfileData } from "../types";
import { SuperAdminApi } from "../api/use-profile";

export const ProfileForm = () => {
  const [initialData, setInitialData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", avatarUrl: "", title: "", phone: "", notes: "" },
  });

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await SuperAdminApi.getProfile();
      if (data) {
        setInitialData(data);
        form.reset(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  // Handle Image Upload to Server
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      // Replace this with your actual upload API endpoint
      // Example: const response = await SuperAdminApi.uploadImage(formData);
      // const imageUrl = response.url;
      
      // FOR DEMO: Using a temporary local preview URL
      const imageUrl = URL.createObjectURL(file); 
      
      form.setValue("avatarUrl", imageUrl, { shouldDirty: true });
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const onUpdateSubmit = async (values: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...values,
        phone: values.phone.startsWith('+') ? values.phone : `+91${values.phone}`
      };

      const response = initialData 
        ? await SuperAdminApi.updateProfile(payload)
        : await SuperAdminApi.createProfile(payload);

      toast.success(initialData ? "Profile updated" : "Profile created");
      
      // TRIGGER HEADER REFRESH
      window.dispatchEvent(new Event("profile-updated"));

      setInitialData(response);
      form.reset(response);
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 1. PROFILE DISPLAY CARD */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-emerald-600 h-32 w-full" />
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-lg">
              <div className="h-full w-full rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                {initialData?.avatarUrl ? (
                  <img 
                    key={initialData.avatarUrl} // Forces refresh when URL changes
                    src={initialData.avatarUrl} 
                    alt="Profile" 
                    className="h-full w-full object-cover" 
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
              <Pencil size={16} />
              Update Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <InfoItem icon={<User size={18}/>} label="Full Name" value={initialData?.fullName || "Not set"} />
            <InfoItem icon={<Briefcase size={18}/>} label="Professional Title" value={initialData?.title || "Not set"} />
            <InfoItem icon={<Phone size={18}/>} label="Phone Number" value={initialData?.phone || "Not set"} />
            <InfoItem icon={<FileText size={18}/>} label="Notes" value={initialData?.notes || "No notes available"} isFullWidth />
          </div>
        </div>
      </div>

      {/* 2. EDIT MODAL FORM */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-500/10"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-gray-900">Edit Profile</h3>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <AlertCircle size={24} className="rotate-45 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-6">
                  {/* AVATAR UPLOAD SECTION */}
                  <div className="flex flex-col items-center justify-center pb-6 border-b border-gray-100 mb-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="h-28 w-28 rounded-3xl overflow-hidden bg-gray-100 border-4 border-emerald-50 shadow-inner flex items-center justify-center">
                        {form.watch("avatarUrl") ? (
                          <img src={form.watch("avatarUrl")} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <User size={40} className="text-gray-300" />
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-3xl">
                            <Loader2 className="animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-600 rounded-xl border-4 border-white flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Camera size={18} />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    <p className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Click to change photo</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput label="Full Name" name="fullName" register={form.register} />
                    <FormInput label="Professional Title" name="title" register={form.register} />
                    <FormInput label="Phone Number" name="phone" register={form.register} />
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 ml-1">Notes</label>
                       <textarea 
                        {...form.register("notes")} 
                        rows={3} 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 outline-none transition-all md:col-span-2"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 px-6 py-4 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting || isUploading}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold px-6 py-4 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={18} />}
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Helper Components ---

const InfoItem = ({ icon, label, value, isFullWidth }: { icon: any, label: string, value: string, isFullWidth?: boolean }) => (
  <div className={`space-y-1 ${isFullWidth ? "md:col-span-2" : ""}`}>
    <div className="flex items-center gap-2 text-gray-400">
      {icon}
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-gray-900 font-semibold pl-7 truncate">{value}</p>
  </div>
);

const FormInput = ({ label, name, register }: { label: string, name: any, register: any }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
    <input 
      {...register(name)} 
      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 outline-none transition-all" 
    />
  </div>
);